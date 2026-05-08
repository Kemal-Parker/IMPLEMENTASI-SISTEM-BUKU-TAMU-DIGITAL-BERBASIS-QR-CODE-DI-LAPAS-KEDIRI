import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit increased for base64 images
  app.use(express.json({ limit: '50mb' }));

  // ========== API ROUTES ==========
  
  // Dashboard stats
  app.get('/api/stats', (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const activeCount = db.prepare(`SELECT count(*) as count FROM guests WHERE status = 'Aktif'`).get() as { count: number };
      const todayCount = db.prepare(`SELECT count(*) as count FROM guests WHERE date(check_in_time) = date('now')`).get() as { count: number };
      
      res.json({
        activeGuests: activeCount.count,
        todayGuests: todayCount.count
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Get active guests
  app.get('/api/guests/active', (req, res) => {
    try {
      const guests = db.prepare(`SELECT * FROM guests WHERE status = 'Aktif' ORDER BY check_in_time DESC`).all();
      res.json(guests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch active guests' });
    }
  });

  // Get guest history (finished visitors)
  app.get('/api/guests/history', (req, res) => {
    try {
      // Don't select photo_url to save memory/bandwidth
      const guests = db.prepare(`SELECT id, nik, name, address, phone, inmate_name, relationship, purpose, status, check_in_time, check_out_time FROM guests WHERE status = 'Selesai' ORDER BY check_out_time DESC`).all();
      res.json(guests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // Check-in (new guest)
  app.post('/api/guests/check-in', (req, res) => {
    try {
      const { nik, name, address, phone, inmate_name, relationship, purpose, photo_url } = req.body;
      
      const stmt = db.prepare(`
        INSERT INTO guests (nik, name, address, phone, inmate_name, relationship, purpose, photo_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(nik, name, address, phone, inmate_name, relationship, purpose, photo_url || null);
      
      res.status(201).json({ success: true, id: result.lastInsertRowid });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to check-in guest' });
    }
  });

  // Check-out guest
  app.post('/api/guests/:id/check-out', (req, res) => {
    try {
      const id = req.params.id;
      const stmt = db.prepare(`
        UPDATE guests 
        SET status = 'Selesai', check_out_time = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'Aktif'
      `);
      
      const result = stmt.run(id);
      
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Guest not found or already checked out' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to check-out guest' });
    }
  });

  // Delete guest record
  app.delete('/api/guests/:id', (req, res) => {
    try {
      const id = req.params.id;
      const stmt = db.prepare(`DELETE FROM guests WHERE id = ?`);
      const result = stmt.run(id);
      
      if (result.changes > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Guest not found' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete guest' });
    }
  });

  // Export CSV
  app.get('/api/export/csv', (req, res) => {
    try {
      const guests = db.prepare(`SELECT id, nik, name, address, phone, inmate_name, relationship, purpose, status, check_in_time, check_out_time FROM guests WHERE status = 'Selesai' ORDER BY check_out_time DESC`).all() as any[];
      
      if (guests.length === 0) {
        return res.status(404).send('No data to export');
      }

      const headers = ['ID', 'NIK', 'Name', 'Address', 'Phone', 'Inmate Name', 'Relationship', 'Purpose', 'Check In', 'Check Out'];
      
      const escapeCsv = (str: string) => `"${String(str || '').replace(/"/g, '""')}"`;
      
      const rows = guests.map(g => [
        g.id, g.nik, g.name, g.address, g.phone, g.inmate_name, g.relationship, g.purpose, g.check_in_time, g.check_out_time
      ].map(escapeCsv).join(','));
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=riwayat_tamu.csv');
      res.send(csvContent);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
