using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace System.Web.Mvc.Html
{
    public static class AngularExtensions
    {
        public static IHtmlString ngTextboxFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression)
        {
            return html.ngTextboxFor(expression, ((IDictionary<string, object>)new RouteValueDictionary()));
        }

        public static IHtmlString ngTextboxFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, object htmlAttributes)
        {
            return html.ngTextboxFor(expression, HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
        }

        public static IHtmlString ngTextboxFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, IDictionary<string, object> htmlAttributes)
        {
            var expressionText = ExpressionHelper.GetExpressionText(expression);
            var metadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            var ngAttributes = new Dictionary<string, object>();

            ngAttributes["ng-model"] = html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(expressionText);

            if (metadata.IsRequired)
            {
                ngAttributes["required"] = null;
            }

            if (string.Equals(metadata.DataTypeName, "EmailAddress", StringComparison.OrdinalIgnoreCase))
            {
                ngAttributes["type"] = "email";
            }

            return html.TextBoxFor(expression, MergeAttributes(ngAttributes, htmlAttributes));
        }

        public static IHtmlString ngValidationMessageFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression, string formName)
        {
            return ngValidationMessageFor(htmlHelper, expression, formName, ((IDictionary<string, object>)new RouteValueDictionary()));
        }

        public static IHtmlString ngValidationMessageFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression, string formName, object htmlAttributes)
        {
            return ngValidationMessageFor(htmlHelper, expression, formName, HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
        }

        public static IHtmlString ngValidationMessageFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, string formName, IDictionary<string, object> htmlAttributes)
        {
            var expressionText = ExpressionHelper.GetExpressionText(expression);
            var metadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            var modelName = html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(expressionText);

            var validators = metadata.GetValidators(html.ViewContext.Controller.ControllerContext);
            var ngShowFormat = "({0}.submitAttempted || {0}.{1}.$dirty) && {0}.{1}.$error.{2}";
            var tag = new TagBuilder("span");
            
            foreach (var validator in validators)
            {
                if (validator.IsRequired)
                {
                    tag.Attributes["ng-show"] = string.Format(ngShowFormat, formName, modelName, "required");

                    var validationMessage = validator.GetClientValidationRules()
                        .Select(r => r.ErrorMessage)
                        .FirstOrDefault();

                    tag.SetInnerText(validationMessage);
                }
            }

            tag.MergeAttributes(htmlAttributes);

            return html.Raw(tag.ToString());
        }

        public static string ngValidationClassFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, string formName, string className)
        {
            var expressionText = ExpressionHelper.GetExpressionText(expression);
            var metadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            var modelName = html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(expressionText);
            var ngClassFormat = "{{ '{0}' : ({1}.submitAttempted || {1}.{2}.$dirty) && {1}.{2}.$invalid }}";

            return string.Format(ngClassFormat, className, formName, modelName);
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