﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace System.Web.Mvc.Html
{
    public static class AngularExtensions
    {
        public static IHtmlString ngPasswordFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression)
        {
            return html.ngTextBoxFor(expression, new RouteValueDictionary { { "type", "password" } });
        }

        public static IHtmlString ngPasswordFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, object htmlAttributes)
        {
            return html.ngTextBoxFor(expression, MergeAttributes(
                new RouteValueDictionary { { "type", "password" } },
                HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes)));
        }

        public static IHtmlString ngPasswordFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, IDictionary<string, object> htmlAttributes)
        {
            return html.ngTextBoxFor(expression, MergeAttributes(
                new RouteValueDictionary { { "type", "password" } },
                htmlAttributes));
        }

        public static IHtmlString ngTextBoxFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression)
        {
            return html.ngTextBoxFor(expression, new RouteValueDictionary());
        }

        public static IHtmlString ngTextBoxFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, object htmlAttributes)
        {
            return html.ngTextBoxFor(expression, HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
        }

        public static IHtmlString ngTextBoxFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, IDictionary<string, object> htmlAttributes)
        {
            var expressionText = ExpressionHelper.GetExpressionText(expression);
            var metadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            var ngAttributes = new Dictionary<string, object>();
            
            // Angular binding to client-side model (scope). This is required for Angular validation to work.
            ngAttributes["ng-model"] = html.ViewData.TemplateInfo.GetFullHtmlFieldName(expressionText);
            
            // Set input type
            if (string.Equals(metadata.DataTypeName, Enum.GetName(typeof(DataType), DataType.EmailAddress), StringComparison.OrdinalIgnoreCase))
            {
                ngAttributes["type"] = "email";
            }
            else if (metadata.ModelType == typeof(Uri)
                     || string.Equals(metadata.DataTypeName, Enum.GetName(typeof(DataType), DataType.Url), StringComparison.OrdinalIgnoreCase)
                     || string.Equals(metadata.DataTypeName, Enum.GetName(typeof(DataType), DataType.ImageUrl), StringComparison.OrdinalIgnoreCase))
            {
                ngAttributes["type"] = "url";
            }
            else if (IsNumberType(metadata.ModelType))
            {
                ngAttributes["type"] = "number";
                if (IsIntegerType(metadata.ModelType))
                {
                    ngAttributes["step"] = "1";
                }
                else
                {
                    ngAttributes["step"] = "any";
                }
            }
            else if (metadata.ModelType == typeof(DateTime))
            {
                if (string.Equals(metadata.DataTypeName, Enum.GetName(typeof(DataType), DataType.Date), StringComparison.OrdinalIgnoreCase))
                {
                    ngAttributes["type"] = "date";
                }
                else if (string.Equals(metadata.DataTypeName, Enum.GetName(typeof(DataType), DataType.DateTime), StringComparison.OrdinalIgnoreCase))
                {
                    ngAttributes["type"] = "datetime";
                }
            }

            // Add attributes for Angular validation
            var clientValidators = metadata.GetValidators(html.ViewContext.Controller.ControllerContext)
                                           .SelectMany(v => v.GetClientValidationRules());

            foreach (var validator in clientValidators)
            {
                if (string.Equals(validator.ValidationType, "length"))
                {
                    if (validator.ValidationParameters.ContainsKey("min"))
                    {
                        ngAttributes["ng-minlength"] = validator.ValidationParameters["min"];
                    }
                    if (validator.ValidationParameters.ContainsKey("max"))
                    {
                        ngAttributes["ng-maxlength"] = validator.ValidationParameters["max"];
                    }
                }
                else if (string.Equals(validator.ValidationType, "required"))
                {
                    ngAttributes["required"] = null;
                }
                else if (string.Equals(validator.ValidationType, "range"))
                {
                    if (validator.ValidationParameters.ContainsKey("min"))
                    {
                        ngAttributes["min"] = validator.ValidationParameters["min"];
                    }
                    if (validator.ValidationParameters.ContainsKey("max"))
                    {
                        ngAttributes["max"] = validator.ValidationParameters["max"];
                    }
                }
                else if (string.Equals(validator.ValidationType, "equalto"))
                {
                    // CompareAttribute validator
                    var fieldToCompare = validator.ValidationParameters["other"]; // e.g. *.NewPassword
                    var other = validator.ValidationParameters["other"].ToString();
                    if (other.StartsWith("*."))
                    {
                        // The built-in CompareAttributeAdapter prepends *. to the property name so we strip it off here
                        other = other.Substring("*.".Length);
                    }
                    ngAttributes["app-equal-to"] = other;
                    // TODO: Actually write the Angular directive to use this
                }
                // TODO: Regex, Phone(regex)
            }

            // Render!
            return html.TextBoxFor(expression, MergeAttributes(ngAttributes, htmlAttributes));
        }

        private static bool IsNumberType(Type type)
        {
            switch (Type.GetTypeCode(type))
            {
                case TypeCode.Int16:
                case TypeCode.Int32:
                case TypeCode.Int64:
                case TypeCode.UInt16:
                case TypeCode.UInt32:
                case TypeCode.UInt64:
                case TypeCode.Decimal:
                case TypeCode.Double:
                case TypeCode.Single:
                    return true;
            }
            return false;
        }

        private static bool IsIntegerType(Type type)
        {
            switch (Type.GetTypeCode(type))
            {
                case TypeCode.Int16:
                case TypeCode.Int32:
                case TypeCode.Int64:
                case TypeCode.UInt16:
                case TypeCode.UInt32:
                case TypeCode.UInt64:
                    return true;
            }
            return false;
        }

        public static IHtmlString ngDropDownListFor<TModel, TProperty, TDisplayProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> propertyExpression, Expression<Func<TModel, TDisplayProperty>> displayExpression, string source, string nullOption, object htmlAttributes)
        {
            return ngDropDownListFor(html, propertyExpression, displayExpression, source, nullOption, HtmlHelper.AnonymousObjectToHtmlAttributes(htmlAttributes));
        }

        public static IHtmlString ngDropDownListFor<TModel, TProperty, TDisplayProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> propertyExpression, Expression<Func<TModel, TDisplayProperty>> displayExpression, string source, string nullOption, IDictionary<string, object> htmlAttributes)
        {
            var propertyExpressionText = ExpressionHelper.GetExpressionText(propertyExpression);
            var displayExpressionText = ExpressionHelper.GetExpressionText(displayExpression);
            var metadata = ModelMetadata.FromLambdaExpression(propertyExpression, html.ViewData);
            var tag = new TagBuilder("select");

            var valueFieldName = html.ViewData.TemplateInfo.GetFullHtmlFieldName(propertyExpressionText);
            var displayFieldName = html.ViewData.TemplateInfo.GetFullHtmlFieldName(displayExpressionText);

            var displayFieldNameParts = displayFieldName.Split('.');
            displayFieldName = displayFieldNameParts[displayFieldNameParts.Length - 1];

            tag.Attributes["id"] = html.ViewData.TemplateInfo.GetFullHtmlFieldId(propertyExpressionText);
            tag.Attributes["name"] = valueFieldName;
            tag.Attributes["ng-model"] = valueFieldName;

            var ngOptionsFormat = "a.{0} as a.{1} for a in {2}";
            var ngOptions = string.Format(ngOptionsFormat, valueFieldName, displayFieldName, source);
            tag.Attributes["ng-options"] = ngOptions;

            if (nullOption != null)
            {
                var nullOptionTag = new TagBuilder("option");
                nullOptionTag.Attributes["value"] = string.Empty;
                nullOptionTag.SetInnerText(nullOption);
                tag.InnerHtml = nullOptionTag.ToString();
            }

            if (metadata.IsRequired)
            {
                tag.Attributes["required"] = string.Empty;
            }

            tag.MergeAttributes(htmlAttributes, replaceExisting: true);

            return html.Raw(tag.ToString());
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
            var modelName = html.ViewData.TemplateInfo.GetFullHtmlFieldName(expressionText);
            
            var clientValidators = metadata.GetValidators(html.ViewContext.Controller.ControllerContext)
                                           .SelectMany(v => v.GetClientValidationRules());
            var tags = new List<TagBuilder>();

            // Get validation messages from data type
            // TODO: How to get validation messages from model metadata? All methods/properties required seem protected internal :(

            foreach (var validator in clientValidators)
            {
                var tag = new TagBuilder("span");
                tag.Attributes["ng-cloak"] = string.Empty;

                if (string.Equals(validator.ValidationType, "required"))
                {
                    tag.Attributes["ng-show"] = string.Format("({0}.submitAttempted || {0}.{1}.$dirty || {0}.{1}.visited) && {0}.{1}.$error.{2}", formName, modelName, "required");
                    tag.SetInnerText(validator.ErrorMessage);
                }
                else if (string.Equals(validator.ValidationType, "length"))
                {
                    tag.Attributes["ng-show"] = string.Format("({0}.submitAttempted || {0}.{1}.$dirty || {0}.{1}.visited) && ({0}.{1}.$error.minlength || {0}.{1}.$error.maxlength)",
                        formName, modelName);
                    tag.SetInnerText(validator.ErrorMessage);
                }
                else if (string.Equals(validator.ValidationType, "range"))
                {
                    tag.Attributes["ng-show"] = string.Format("({0}.submitAttempted || {0}.{1}.$dirty || {0}.{1}.visited) && ({0}.{1}.$error.min || {0}.{1}.$error.max)",
                        formName, modelName);
                    tag.SetInnerText(validator.ErrorMessage);
                }
                // TODO: Regex, equalto, remote
                else
                {
                    continue;
                }

                tag.MergeAttributes(htmlAttributes);
                tags.Add(tag);
            }

            return html.Raw(String.Concat(tags.Select(t => t.ToString())));
        }

        public static string ngValidationClassFor<TModel, TProperty>(this HtmlHelper<TModel> html, Expression<Func<TModel, TProperty>> expression, string formName, string className)
        {
            var expressionText = ExpressionHelper.GetExpressionText(expression);
            var metadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            var modelName = html.ViewData.TemplateInfo.GetFullHtmlFieldName(expressionText);
            var ngClassFormat = "{{ '{0}' : ({1}.submitAttempted || {1}.{2}.$dirty || {1}.{2}.visited) && {1}.{2}.$invalid }}";

            return string.Format(ngClassFormat, className, formName, modelName);
        }

        private static IDictionary<string, object> MergeAttributes(IDictionary<string, object> source, IDictionary<string, object> target)
        {
            // Keys in target win over keys in source
            foreach (var pair in source)
            {
                if (!target.ContainsKey(pair.Key))
                {
                    target[pair.Key] = pair.Value;
                }
            }

            return target;
        }
    }
}