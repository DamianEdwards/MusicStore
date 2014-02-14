using System.Text;
using Newtonsoft.Json;

namespace System.Web.Mvc
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
    }
}