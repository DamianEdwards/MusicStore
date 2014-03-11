using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using MvcMusicStore.Models;

namespace MvcMusicStore.Apis
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

        [Route("api/albums/{albumId:int}/update")]
        [HttpPost]
        public ActionResult UpdateAlbum(int albumId)
        {
            var album = _storeContext.Albums.SingleOrDefault(a => a.AlbumId == albumId);
            
            if (album == null)
            {
                return new ApiResult
                {
                    StatusCode = 404,
                    Message = string.Format("The album with ID {0} was not found.", albumId)
                };
            }

            if (TryUpdateModel(album, prefix: null, includeProperties: null, excludeProperties: new[] { "OrderDetails" }))
            {
                // Save the changes to the DB
                _storeContext.SaveChanges();

                // TODO: Handle missing record, key violations, concurrency issues, etc.
                
                return new ApiResult
                {
                    Message = "Album updated successfully."
                };
            }
            else
            {
                // Return the model errors
                return new ApiResult(ModelState);
            }
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
