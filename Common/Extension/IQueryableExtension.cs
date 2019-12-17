using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;

namespace Common.Extension
{
    public static class IQueryableExtension
    {
        public static IQueryable Select(this IQueryable source, IList<Expression> exprList)
        {
            var parameter = Expression.Parameter(source.ElementType, "t");
            var lambda = parameter.CreateLambdaExpresion(exprList);
            return source.Select(lambda);
        }

        public static IList<TEntity> GetValues<TEntity>(this IQueryable source, IList<Expression> exprList)
        {
            var values = source.Select(exprList).ToIList();
            var list = new List<TEntity>();
            foreach(var value in values)
            {
                var entity = Activator.CreateInstance<TEntity>();
                foreach(var info in value.GetType().GetProperties().Where(t => t.Name != "Item"))
                    UpdateEntity<TEntity>(entity, info.Name, info.GetValue(value));
                list.Add(entity);
            }
            return list;
        }

        private static void UpdateEntity<TEntity>(TEntity entity, string path, object value)
        {
            var index = 1;var array = path.Split('.');
            object obj = entity;
            foreach(var str in array)
            {
                var info = obj.GetType().GetProperty(str);
                if (array.Length == index)
                    info.SetValue(obj, value);
                else if (info.GetValue(obj) == null)
                    info.SetValue(obj, Activator.CreateInstance(info.PropertyType));
                obj = info.GetValue(obj);
                index++;
            }
        }

        public static IQueryable Select(this IQueryable source, LambdaExpression lambda)
        {
            return source.Provider.CreateQuery(
                Expression.Call(typeof(Queryable), "Select", new Type[] { source.ElementType, lambda.Body.Type },
                source.Expression, Expression.Quote(lambda)));
        }

        public static IList ToIList(this IQueryable source)
        {
            if (source == null)
                throw new ArgumentNullException("source");
            var list = (IList)Activator.CreateInstance(typeof(ArrayList));
            foreach (var item in source)
                list.Add(item);
            return list;
        }

        internal static IQueryable<TEntity> Search<TEntity>(this IQueryable<TEntity> source, TEntity search) where TEntity : class
        {
            if (search == null)
                return source;
            var list = new List<string>();
            GetSearchFieldsName(list, search, null);
            if (list.Count == 0)
                return source;
            ParameterExpression parameter = Expression.Parameter(typeof(TEntity), "t");
            Expression left = null;
            foreach (var fieldName in list)
            {
                var type = search.GetType();
                object value = search;
                Expression propertyExpr = parameter;
                PropertyInfo field = null;
                foreach (var item in fieldName.Split('.'))
                {
                    field = type.GetProperty(item);
                    propertyExpr = Expression.Property(propertyExpr, field);
                    value = field.GetValue(value);
                    type = field.PropertyType;
                }
                var foreignKeyFields = field.DeclaringType.GetProperties().Where(t => t.CustomAttributes
                    .Any(u => u.AttributeType == typeof(ForeignKeyAttribute)))
                    .Select(t => t.GetCustomAttribute<ForeignKeyAttribute>().Name);
                var constant = Expression.Constant(value, field.PropertyType);
                Expression right = null;
                if (foreignKeyFields.Any(t => t == field.Name) || field.PropertyType != typeof(string))
                    right = Expression.Equal(propertyExpr, constant);
                else
                {
                    var method = typeof(string).GetMethod("Contains", new Type[] { typeof(string) });
                    right = Expression.Call(propertyExpr, method, constant);
                }
                if (left == null)
                    left = right;
                else
                    left = Expression.AndAlso(left, right);
            }
            var lambda = Expression.Lambda(left, new ParameterExpression[] { parameter });
            return source.Provider.CreateQuery<TEntity>(
                Expression.Call(typeof(Queryable), "Where", new Type[] { source.ElementType },
                    source.Expression, Expression.Quote(lambda)));
        }

        public static IQueryable Where(this IQueryable source, Expression lambda)
        {
            return source.Provider.CreateQuery(Expression.Call(typeof(Queryable), "Where",
                new Type[] { source.ElementType }, source.Expression, Expression.Quote(lambda)));
        }

        /// <summary>
        /// این متد لیست تمامی فیلدهایی را که باید در جستجو باشند را برمی گرداند
        /// </summary>
        private static void GetSearchFieldsName(IList<string> fieldsName, object search, string fieldName)
        {
            var type = search.GetType();
            foreach (var field in type.GetProperties())
            {
                var notMappedAttr = field.GetCustomAttribute<NotMappedAttribute>();
                if (notMappedAttr == null)
                {
                    var value = field.GetValue(search);
                    string str = field.Name;
                    if (fieldName.HasValue())
                        str = fieldName + '.' + str;

                    if (value != null)
                    {
                        var isEqualToDefault = true;
                        if (field.PropertyType.IsValueType)
                        {
                            object defaltValue = Activator.CreateInstance(field.PropertyType);
                            isEqualToDefault = value.Equals(defaltValue);
                        }
                        if (!field.PropertyType.CustomAttributes.Any(t => t.AttributeType == typeof(ComplexTypeAttribute)))
                        {
                            if (!isEqualToDefault || field.PropertyType.IsNullableType() || field.PropertyType == typeof(string) || field.PropertyType == typeof(bool))
                                fieldsName.Add(str);
                            else
                                if (!field.PropertyType.IsValueType)
                                GetSearchFieldsName(fieldsName, value, str);
                        }
                    }
                }
            }
        }
    }
}
