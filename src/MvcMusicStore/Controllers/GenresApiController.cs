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
    public class GenresApiController : ApiController
    {
        private readonly MusicStoreEntities _storeContext = new MusicStoreEntities();

        [Route("api/genres")]
        [HttpGet]
        public async Task<IEnumerable<Genre>> GenreList()
        {
            return await _storeContext.Genres
                .Include(g => g.Albums)
                .OrderBy(g => g.Name)
                .ToListAsync();
        }

        [Route("api/genres/{genreId:int}/albums")]
        [HttpGet]
        public async Task<IEnumerable<Album>> GenreAlbums(int genreId)
        {
            return await _storeContext.Albums
                .Where(a => a.GenreId == genreId)
                .Include(a => a.Genre)
                .Include(a => a.Artist)
                .OrderBy(a => a.Genre.Name)
                .ToListAsync();
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