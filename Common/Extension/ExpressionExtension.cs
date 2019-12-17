
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Common.Extension
{
    public static class ExpressionExtension
    {
        public static LambdaExpression CreateLambdaExpresion(this ParameterExpression param, IList<Expression> list)
        {
            var type = param.Type.CreateDynamicType(list);
            var memberExprList = new List<MemberAssignment>();
            foreach (var expr in list)
            {
                var str = expr.ToString();
                str = str.Substring(str.IndexOf('.') + 1);
                var info = type.GetProperty(str);
                memberExprList.Add(Expression.Bind(info, param.CreateMemberExpresion(str)));
            }
            var memberInit = Expression.MemberInit(Expression.New(type), memberExprList);
            return Expression.Lambda(memberInit, param);
        }

        /// <summary>
        /// این متد با توجه به مسیر ورودی خود یک <see cref="MemberExpression" تولید می کند/>
        /// </summary>
        public static MemberExpression CreateMemberExpresion(this ParameterExpression param, string path)
        {
            Expression expr = param;
            var type = param.Type;
            var prop = type.GetProperties();
            foreach (var str in path.Split('.'))
            {
                var info = type.GetProperty(str);
                if (info == null)
                    return null;
                type = info.PropertyType;
                expr = Expression.Property(expr, info);
            }
            return expr as MemberExpression;
        }
    }
}
