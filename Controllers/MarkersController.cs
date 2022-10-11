using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using GeoMarker.Data;
using GeoMarker.Models;

namespace GeoMarker.Controllers
{
    public class MarkersController : Controller
    {
        private readonly ApplicationDbContext _context;

        public MarkersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Markers
        public async Task<IActionResult> Index()
        {
              return View(await _context.Markers.ToListAsync());
        }

        // GET: Markers/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null || _context.Markers == null)
            {
                return NotFound();
            }

            var marker = await _context.Markers
                .FirstOrDefaultAsync(m => m.MarkerId == id);
            if (marker == null)
            {
                return NotFound();
            }

            return View(marker);
        }

        // GET: Markers/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Markers/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("MarkerId,UserId,Title,Description,Photo,Address,Latitude,Longitude,CreatedDate")] Marker marker)
        {
            if (ModelState.IsValid)
            {
                _context.Add(marker);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(marker);
        }

        // GET: Markers/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null || _context.Markers == null)
            {
                return NotFound();
            }

            var marker = await _context.Markers.FindAsync(id);
            if (marker == null)
            {
                return NotFound();
            }
            return View(marker);
        }

        // POST: Markers/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("MarkerId,UserId,Title,Description,Photo,Address,Latitude,Longitude,CreatedDate")] Marker marker)
        {
            if (id != marker.MarkerId)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(marker);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!MarkerExists(marker.MarkerId))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(marker);
        }

        // GET: Markers/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null || _context.Markers == null)
            {
                return NotFound();
            }

            var marker = await _context.Markers
                .FirstOrDefaultAsync(m => m.MarkerId == id);
            if (marker == null)
            {
                return NotFound();
            }

            return View(marker);
        }

        // POST: Markers/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            if (_context.Markers == null)
            {
                return Problem("Entity set 'ApplicationDbContext.Markers'  is null.");
            }
            var marker = await _context.Markers.FindAsync(id);
            if (marker != null)
            {
                _context.Markers.Remove(marker);
            }
            
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool MarkerExists(int id)
        {
          return _context.Markers.Any(e => e.MarkerId == id);
        }
    }
}
