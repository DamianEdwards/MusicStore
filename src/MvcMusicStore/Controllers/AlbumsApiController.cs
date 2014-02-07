using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using MvcMusicStore.Models;

namespace MvcMusicStore.Controllers
{
    public class AlbumsApiController : ApiController
    {
        private readonly MusicStoreEntities _storeContext = new MusicStoreEntities();

        [Route("api/albums/mostPopular")]
        [HttpGet]
        public async Task<IEnumerable<Album>> MostPopular(int count = 6)
        {
            count = count > 0 && count < 20 ? count : 6;

            return await _storeContext.Albums
                .OrderByDescending(a => a.OrderDetails.Count())
                .Take(count)
                .ToListAsync();
        }

        [Route("api/albums/{albumId:int}")]
        [HttpGet]
        public async Task<Album> Details(int albumId)
        {
            return await _storeContext.Albums
                .Include(a => a.Artist)
                .Include(a => a.Genre)
                .SingleOrDefaultAsync(a => a.AlbumId == albumId);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _storeContext.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
