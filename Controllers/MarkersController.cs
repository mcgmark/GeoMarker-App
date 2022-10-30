using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using GeoMarker.Data;
using GeoMarker.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;

namespace GeoMarker.Controllers
{
    [Authorize]
    public class MarkersController : Controller
    {
        private readonly ApplicationDbContext _context;

        public MarkersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Markers
        [AllowAnonymous]
        public async Task<IActionResult> Index()
        {
            var applicationDbContext = _context.Markers;
            return View(await applicationDbContext.ToListAsync());
        }

        [AllowAnonymous]
        // GET: Markers/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null || _context.Markers == null)
            {
                return NotFound();
            }

            var marker = await _context.Markers
                .Include(m => m.Category)
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
            ViewData["CategoryId"] = new SelectList(_context.Categories, "CategoryId", "Name");
            ViewData["CurrentDate"] = DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss");
            return View();
        }

        // POST: Markers/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("MarkerId,UserName,Title,CategoryId,Description,Address,Latitude,Longitude,CreatedDate")] Marker marker, IFormFile? Photo)
        {
            if (ModelState.IsValid)
            {

                if (Photo != null)
                {
                    var fileName = UploadPhoto(Photo);
                    marker.Photo = fileName;
                }

     
                _context.Add(marker);
                await _context.SaveChangesAsync();
                return RedirectToAction("Details", new { id = marker.MarkerId});
            }
            ViewData["CategoryId"] = new SelectList(_context.Categories, "CategoryId", "Name", marker.CategoryId);
            return View(marker.MarkerId);
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
            ViewData["CategoryId"] = new SelectList(_context.Categories, "CategoryId", "Name", marker.CategoryId);
            ViewData["CurrentDate"] = DateTime.Now.ToString("yyyy-MM-dd hh:mm:ss");

            return View(marker);
        }

        // POST: Markers/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("MarkerId,UserName,Title,CategoryId,Description,Photo,Address,Latitude,Longitude,CreatedDate")] Marker marker)
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
                return RedirectToAction("Details", new { id = marker.MarkerId });
            }
            ViewData["CategoryId"] = new SelectList(_context.Categories, "CategoryId", "Name", marker.CategoryId);
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
                .Include(m => m.Category)
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

        //Return model as JSON for Javascript 
        [AllowAnonymous]
        public JsonResult GetMarkerData()
        {
            var markerData = _context.Markers;
            return Json(markerData);
        }

        private static string UploadPhoto(IFormFile Photo)
        {
            // get temp location of uploaded photo
            var filePath = Path.GetTempFileName();

            // use Globally Unique Identifier class AKA GUID to ensure we name the photo a unique name
            // myPhoto.jpg => 34jh324jh34jh34-myPhoto.jpg
            var fileName = Guid.NewGuid() + "-" + Photo.FileName;

            // set the destination path to wwwroot/img/products
            // This must be dynamic so it works on any server as each server uses its own directory path
            var uploadPath = System.IO.Directory.GetCurrentDirectory() + "\\wwwroot\\img\\markers\\" + fileName;

            // use a filestream to copy the upload to this folder 
            using (var stream = new FileStream(uploadPath, FileMode.Create))
            {
                Photo.CopyTo(stream);
            }
            // send back the new unique file name

            return fileName;

        }
    }
}
