using System.Text;
using Newtonsoft.Json;

namespace System.Web.Mvc.Html
{
    public static class HtmlHelpers
    {
        public static IHtmlString Json<T, TData>(this HtmlHelper<T> helper, string id, TData data)
        {
            var sb = new StringBuilder();
            
            sb.Append("<script type=\"application/json\" data-json-id=\"");
            sb.Append(id);
            sb.AppendLine("\">");

            sb.AppendLine(JsonConvert.SerializeObject(data));

            sb.Append("</script>");

            return helper.Raw(sb.ToString());
        }

        public static IHtmlString InlineData<T>(this HtmlHelper<T> helper, string actionName, string controllerName)
        {
            var result = helper.Action(actionName, controllerName);
            var urlHelper = new UrlHelper(helper.ViewContext.RequestContext);

            var url = urlHelper.Action(actionName, controllerName);

            var sb = new StringBuilder();

            sb.Append("<script type=\"application/json\" mus-inline-data for=\"");
            sb.Append(url);
            sb.AppendLine("\">");

            sb.AppendLine(result.ToString());

            sb.Append("</script>");

            return helper.Raw(sb.ToString());
        }

        public static IHtmlString InlineData<T, TData>(this HtmlHelper<T> helper, string relativeUrl, TData data)
        {
            var urlHelper = new UrlHelper(helper.ViewContext.RequestContext);

            var sb = new StringBuilder();

            sb.Append("<script type=\"application/json\" mus-inline-data for=\"");
            sb.Append(urlHelper.Content(relativeUrl));
            sb.AppendLine("\">");

            sb.AppendLine(JsonConvert.SerializeObject(data));

            sb.Append("</script>");

            return helper.Raw(sb.ToString());
        }

        public static IHtmlString InlineApiResult<T, TData>(this HtmlHelper<T> helper, string relativeUrl, TData data)
        {
            var urlHelper = new UrlHelper(helper.ViewContext.RequestContext);
            return Json(helper, urlHelper.Content(relativeUrl), data);
        }
    }
}