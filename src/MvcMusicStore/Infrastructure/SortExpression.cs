using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using WebControls=System.Web.UI.WebControls;

namespace MvcMusicStore.Infrastructure
{
    public static class SortExpression
    {
        private const string SORT_DIRECTION_DESC = " DESC";

        public static IQueryable<TModel> SortBy<TModel, TProperty>(this IQueryable<TModel> query, string sortExpression, Expression<Func<TModel, TProperty>> defaultSortExpression, SortDirection defaultSortDirection = SortDirection.Ascending) where TModel : class
        {
            return WebControls.QueryExtensions.SortBy(query, sortExpression ?? Create(defaultSortExpression, defaultSortDirection));
        }

        public static string Create<TModel, TProperty>(Expression<Func<TModel, TProperty>> expression, SortDirection sortDirection = SortDirection.Ascending) where TModel : class
        {
            var expressionText = ExpressionHelper.GetExpressionText(expression);
            // TODO: Validate the expression depth, etc.

            var sortExpression = expressionText;

            if (sortDirection == SortDirection.Descending)
            {
                sortExpression += SORT_DIRECTION_DESC;
            }

            return sortExpression;
        }
    }
}