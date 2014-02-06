using System.Web.Http;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(MvcMusicStore.Startup))]

namespace MvcMusicStore
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);

            ConfigureApp(app);

            //GlobalConfiguration.Configure(WebApiConfig.Register);

            //WebApiConfig.Register(GlobalConfiguration.Configuration);
        }
    }
}
