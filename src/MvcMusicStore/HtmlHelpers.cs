using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using System.Linq;
using Newtonsoft.Json;
using System.Web.Routing;

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

            var builder = new TagBuilder("script");
            builder.Attributes["type"] = "application/json";
            builder.Attributes["mus-inline-data"] = null;
            builder.Attributes["for"] = url;
            builder.InnerHtml = result.ToString().Replace("<", "\u003C").Replace(">", "\u003E");

            return helper.Tag(builder);
        }

        public static IHtmlString ngTextboxFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression, object htmlAttributes)
        {
            var metadata = ModelMetadata.FromLambdaExpression(expression, htmlHelper.ViewData);
            var ngAttributes = new Dictionary<string, object>();
            var passedAttributes = ((IDictionary<string, object>)HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));

            if (metadata.IsRequired)
            {
                ngAttributes["required"] = null;
            }

            return htmlHelper.TextBoxFor(expression, MergeAttributes(ngAttributes, passedAttributes));
        }

        public static IHtmlString ngValidationMessageFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression)
        {
            return ngValidationMessageFor(htmlHelper, expression, ((IDictionary<string, object>)new RouteValueDictionary()));
        }

        public static IHtmlString ngValidationMessageFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression, object htmlAttributes)
        {
            var passedAttributes = ((IDictionary<string, object>)HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
            return ngValidationMessageFor(htmlHelper, expression, passedAttributes);
        }

        public static IHtmlString ngValidationMessageFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression, IDictionary<string, object> htmlAttributes)
        {
            var metadata = ModelMetadata.FromLambdaExpression(expression, htmlHelper.ViewData);
            var ngAttributes = new Dictionary<string, object>();
            var ngFormName = "myForm";
            var ngModelName = "input";

            if (metadata.IsRequired)
            {
                ngAttributes["ng-show"] = String.Format("{0}.{1}.$error.required", ngFormName, ngModelName);
            }

            return htmlHelper.ValidationMessageFor(expression, null, MergeAttributes(ngAttributes, htmlAttributes));
        }

        public static IHtmlString Tag(this HtmlHelper htmlHelper, TagBuilder tagBuilder)
        {
            return htmlHelper.Raw(tagBuilder.ToString());
        }

        private static IDictionary<string, object> MergeAttributes(IDictionary<string, object> source, IDictionary<string, object> target)
        {
            foreach (var pair in source)
            {
                target[pair.Key] = pair.Value;
            }

            return target;
        }
    }
}