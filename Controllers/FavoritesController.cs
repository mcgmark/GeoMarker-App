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
    public class FavoritesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FavoritesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Favorites
        public async Task<IActionResult> Index()
        {
            var applicationDbContext = _context.Favorites.Include(f => f.Marker);
            return View(await applicationDbContext.ToListAsync());
        }

        // GET: Favorites/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null || _context.Favorites == null)
            {
                return NotFound();
            }

            var favorite = await _context.Favorites
                .Include(f => f.Marker)
                .FirstOrDefaultAsync(m => m.FavoriteId == id);
            if (favorite == null)
            {
                return NotFound();
            }

            return View(favorite);
        }

        // GET: Favorites/Create
        public IActionResult Create()
        {
            ViewData["MarkerId"] = new SelectList(_context.Markers, "MarkerId", "Description");
            return View();
        }

        // POST: Favorites/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("FavoriteId,UserId,MarkerId")] Favorite favorite)
        {
            if (ModelState.IsValid)
            {
                _context.Add(favorite);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["MarkerId"] = new SelectList(_context.Markers, "MarkerId", "Description", favorite.MarkerId);
            return View(favorite);
        }

        // GET: Favorites/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null || _context.Favorites == null)
            {
                return NotFound();
            }

            var favorite = await _context.Favorites.FindAsync(id);
            if (favorite == null)
            {
                return NotFound();
            }
            ViewData["MarkerId"] = new SelectList(_context.Markers, "MarkerId", "Description", favorite.MarkerId);
            return View(favorite);
        }

        // POST: Favorites/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("FavoriteId,UserId,MarkerId")] Favorite favorite)
        {
            if (id != favorite.FavoriteId)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(favorite);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!FavoriteExists(favorite.FavoriteId))
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
            ViewData["MarkerId"] = new SelectList(_context.Markers, "MarkerId", "Description", favorite.MarkerId);
            return View(favorite);
        }

        // GET: Favorites/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null || _context.Favorites == null)
            {
                return NotFound();
            }

            var favorite = await _context.Favorites
                .Include(f => f.Marker)
                .FirstOrDefaultAsync(m => m.FavoriteId == id);
            if (favorite == null)
            {
                return NotFound();
            }

            return View(favorite);
        }

        // POST: Favorites/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            if (_context.Favorites == null)
            {
                return Problem("Entity set 'ApplicationDbContext.Favorites'  is null.");
            }
            var favorite = await _context.Favorites.FindAsync(id);
            if (favorite != null)
            {
                _context.Favorites.Remove(favorite);
            }
            
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool FavoriteExists(int id)
        {
          return _context.Favorites.Any(e => e.FavoriteId == id);
        }
    }
}
