using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using MvcMusicStore.Models;
using Newtonsoft.Json;

namespace MvcMusicStore.Controllers
{
    public class GenresApiMvcController : Controller
    {
        private readonly MusicStoreEntities _storeContext = new MusicStoreEntities();

        [Route("api/genres/menu")]
        public ActionResult GenreMenuList(int count = 9)
        {
            count = count > 0 && count < 20 ? count : 9;

            return Content(JsonConvert.SerializeObject(_storeContext.Genres
                .OrderByDescending(g => g.Albums.Sum(a => a.OrderDetails.Sum(od => od.Quantity)))
                .Take(count)
                .ToList()));
        }
	}
}