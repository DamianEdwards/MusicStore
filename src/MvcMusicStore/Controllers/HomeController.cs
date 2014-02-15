using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;
using MvcMusicStore.Models;

namespace MvcMusicStore.Controllers
{
    public class HomeController : Controller
    {
        private readonly MusicStoreEntities _storeContext = new MusicStoreEntities();

        // GET: /Home/
        public async Task<ActionResult> Index()
        {
            ViewBag.MenuGenres = await new GenresApiController().GenreMenuList();
            ViewBag.MostPopularAlbums = await new AlbumsApiController().MostPopular();
            return View();
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