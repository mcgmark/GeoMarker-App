using GeoMarker.Controllers;
using GeoMarker.Data;
using GeoMarker.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace GeoMarkerTests
{
    [TestClass]
    public class MarkersControllerTests
    {
        private ApplicationDbContext _context;
        private MarkersController controller;

        [TestInitialize]
        public void TestInitialize()
        {
            // initialize in memory db
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            // create mock data for in memory db to use for tests

            for (var i = 1; i <= 3; i++)
            {
                var marker = new Marker
                {
                    UserName = "Username",
                    Title = i.ToString() + " In-Memory Test Title",
                    Description = i.ToString() + " In-Memory Test Description"
                };
                _context.Add(marker);
            }
            _context.SaveChanges();

            // create new controller instance to use in tests
            controller = new MarkersController(_context);
        }

        #region "Delete"
        [TestMethod]
        public void DeleteGetReturnsView()
        {
            // act.  try id 1 from in memory db
            var result = (ViewResult)controller.Delete(1).Result;

            // assert check that the Delete view is loaded
            Assert.AreEqual("Delete", result.ViewName);
        }

        [TestMethod]
        public void DeleteGetNullReturns404()
        {
            // act - call Delete() with null
            var result = (ViewResult)controller.Delete(null).Result;

            // assert
            Assert.AreEqual("404", result.ViewName);
        }

        [TestMethod]
        public void DeleteGetBadIdLoads404()
        {
            // act.  Test loading of an id that doesn't exist, will return 404 page.
            var result = (ViewResult)controller.Delete(500).Result;

            // assert
            Assert.AreEqual("404", result.ViewName);
        }

        [TestMethod]
        public void DeleteGetId()
        {
            // act - Get working id check that it loads from the database
            var result = (ViewResult)controller.Delete(1).Result;

            var model = (Marker)result.Model;

            // assert
            Assert.AreEqual(_context.Markers.Find(2), model);
        }

        #endregion
    }
}       