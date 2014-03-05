using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using MvcMusicStore.Infrastructure;
using MvcMusicStore.Models;

namespace MvcMusicStore.Controllers
{
    public class AlbumsApiController : Controller
    {
        private readonly MusicStoreEntities _storeContext = new MusicStoreEntities();

        [Route("api/albums")]
        public ActionResult All()
        {
            return new SmartJsonResult
            {
                Data = _storeContext.Albums
                    .Include(a => a.Genre)
                    .Include(a => a.Artist)
                    .OrderBy(a => a.Title)
            };
        }

        [Route("api/albums/mostPopular")]
        public ActionResult MostPopular(int count = 6)
        {
            count = count > 0 && count < 20 ? count : 6;

            return new SmartJsonResult
            {
                Data = _storeContext.Albums
                    .OrderByDescending(a => a.OrderDetails.Count())
                    .Take(count)
            };
        }

        [Route("api/albums/{albumId:int}")]
        public ActionResult Details(int albumId)
        {
            return new SmartJsonResult
            {
                Data = _storeContext.Albums
                    .Include(a => a.Artist)
                    .Include(a => a.Genre)
                    .SingleOrDefault(a => a.AlbumId == albumId)
            };
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
