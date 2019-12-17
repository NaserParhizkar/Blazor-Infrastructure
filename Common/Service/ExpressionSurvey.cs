using System;
using Common.Extension;
using System.Reflection;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// این کلاس برای 
/// </summary>
public class ExpressionSurvey
{
    public bool IsConditionalExpr(Expression expr)
    {
        switch (expr.NodeType)
        {
            case ExpressionType.Add:
            case ExpressionType.Subtract:
            case ExpressionType.Multiply:
            case ExpressionType.Divide:
            case ExpressionType.And:
            case ExpressionType.Or:
            case ExpressionType.Equal:
            case ExpressionType.NotEqual:
            case ExpressionType.GreaterThan:
            case ExpressionType.GreaterThanOrEqual:
            case ExpressionType.LessThan:
            case ExpressionType.LessThanOrEqual:
                var binaryExpr = expr as BinaryExpression;
                if (IsConditionalExpr(binaryExpr.Left))
                    return true;
                return IsConditionalExpr(binaryExpr.Right);
            case ExpressionType.Conditional:
                return true;
            default:
                throw new NotImplementedException("عدم پیاده سازی");
        }
    }

    public Type GetExpressionType(Type mainType, Expression expr)
    {
        switch (expr.NodeType)
        {
            case ExpressionType.MemberAccess:
                var str = expr.ToString();
                str = str.Substring(str.IndexOf('.') + 1);
                return mainType.GetMyProperty(str).PropertyType;
            case ExpressionType.Call:
                var callExpr = expr as MethodCallExpression;
                return callExpr.Method.ReturnType;
            case ExpressionType.Conditional:
                var conditionalExpr = expr as ConditionalExpression;
                return GetExpressionType(mainType, conditionalExpr.IfTrue);
            case ExpressionType.Constant:
                var constantExpr = expr as ConstantExpression;
                return constantExpr.Type;
            default:
                throw new Exception("خطا:Expression is invalid");
        }
    }

    public IList<MemberExpression> Survey(Expression expr)
    {
        var list = new List<MemberExpression>();
        Survey(expr, list);
        return list;
    }

    private void Survey(Expression expr, IList<MemberExpression> list)
    {
        if (expr != null)
        {
            switch (expr.NodeType)
            {
                case ExpressionType.Add:
                case ExpressionType.Subtract:
                case ExpressionType.Multiply:
                case ExpressionType.Divide:
                case ExpressionType.And:
                case ExpressionType.AndAlso:
                case ExpressionType.Or:
                case ExpressionType.OrElse:
                case ExpressionType.Equal:
                case ExpressionType.NotEqual:
                case ExpressionType.GreaterThan:
                case ExpressionType.GreaterThanOrEqual:
                case ExpressionType.LessThan:
                case ExpressionType.LessThanOrEqual:
                    var binaryExpr = expr as BinaryExpression;
                    Survey(binaryExpr.Left, list);
                    Survey(binaryExpr.Right, list);
                    break;
                case ExpressionType.Convert:
                    var unaryExpr = expr as UnaryExpression;
                    Survey(unaryExpr.Operand, list);
                    break;
                case ExpressionType.Call:
                    var callExpr = expr as MethodCallExpression;
                    foreach (var arg in callExpr.Arguments)
                        Survey(arg, list);
                    Survey(callExpr.Object, list);
                    break;
                case ExpressionType.MemberAccess:
                    list.Add(expr as MemberExpression);
                    break;
                case ExpressionType.Conditional:
                    var conditional = expr as ConditionalExpression;
                    Survey(conditional.Test, list);
                    Survey(conditional.IfTrue, list);
                    Survey(conditional.IfFalse, list);
                    break;
                case ExpressionType.Lambda:
                    var lambdaExpr = expr as LambdaExpression;
                    Survey(lambdaExpr.Body);
                    break;
                default:
                    if (expr.NodeType != ExpressionType.Constant && expr.NodeType != ExpressionType.Parameter)
                        throw new Exception("خطا:Expresion is invalid");
                    break;
            }

        }
    }

    public Expression Survey(Expression expr, Func<Expression, Expression> func)
    {
        return Survey(expr, null, null, func.Method, func.Target);
    }

    public Expression Survey<T2>(Expression arg1, T2 arg2, Func<Expression, T2, Expression> func)
    {
        return Survey(arg1, arg2, null, func.Method, func.Target);
    }

    public Expression Survey<T2, T3>(Expression arg1, T2 arg2, T3 arg3, Func<Expression, T2, T3, Expression> func)
    {
        return Survey(arg1, arg2, arg3, func.Method, func.Target);
    }

    private Expression Survey(Expression arg1, object arg2, object arg3, MethodInfo method, object target)
    {
        if (arg1 == null)
            return null;
        switch (arg1.NodeType)
        {
            case ExpressionType.Add:
            case ExpressionType.Subtract:
            case ExpressionType.Multiply:
            case ExpressionType.Divide:
            case ExpressionType.AndAlso:
            case ExpressionType.OrElse:
            case ExpressionType.GreaterThan:
            case ExpressionType.GreaterThanOrEqual:
            case ExpressionType.LessThan:
            case ExpressionType.LessThanOrEqual:
            case ExpressionType.Equal:
            case ExpressionType.NotEqual:
                var binaryExpr = arg1 as BinaryExpression;
                var left = Survey(binaryExpr.Left, arg2, arg3, method, target);
                var right = Survey(binaryExpr.Right, arg2, arg3, method, target);
                return BinaryExpr(left, right, arg1.NodeType);
            case ExpressionType.Call:
                var callExpr = arg1 as MethodCallExpression;
                IList<Expression> arguments = null;
                if (method.Name == "Reduce_")
                {
                    arguments = new List<Expression>();
                    var isFirstTime = true;
                    foreach (var arg in callExpr.Arguments)
                    {
                        if (isFirstTime)
                        {
                            isFirstTime = false;
                            arguments.Add((Expression)Survey(arg, arg2, arg3, method, target));
                        }
                        else
                            arguments.Add(arg);
                    }
                }
                else
                if (callExpr.Method.Name == "Select")
                {
                    arguments = new List<Expression>();
                    arguments.Add((Expression)Survey(callExpr.Arguments[0], arg2, arg3, method, target));
                    if (callExpr.Arguments.Count > 1)
                        arguments.Add(callExpr.Arguments[1]);
                }
                else
                    arguments = callExpr.Arguments.Select(t => (Expression)Survey(t, arg2, arg3, method, target)).ToList();
                var obj = Survey(callExpr.Object, arg2, arg3, method, target);
                return Expression.Call(obj, callExpr.Method, arguments);
            case ExpressionType.Conditional:
                var conditionalExpr = arg1 as ConditionalExpression;
                var testExpr = Survey(conditionalExpr.Test, arg2, arg3, method, target);
                var ifTrueExpr = Survey(conditionalExpr.IfTrue, arg2, arg3, method, target);
                var ifFalseExpr = Survey(conditionalExpr.IfFalse, arg2, arg3, method, target);
                return Expression.Condition(testExpr, ifTrueExpr, ifFalseExpr, conditionalExpr.Type);
            case ExpressionType.Convert:
            case ExpressionType.TypeAs:
                var convertExpr = arg1 as UnaryExpression;
                var operand = Survey(convertExpr.Operand, arg2, arg3, method, target);
                return Expression.Convert(operand, convertExpr.Type, convertExpr.Method);
            case ExpressionType.Constant:
            case ExpressionType.Parameter:
                return arg1;
            case ExpressionType.MemberAccess:
                return CallMethod(arg1, arg2, arg3, method, target);
            case ExpressionType.Lambda:
                var lambdExpr = arg1 as LambdaExpression;
                var body = Survey(lambdExpr.Body, arg2, arg3, method, target);
                var parameters = lambdExpr.Parameters.Select(t => Survey(t, arg2, arg3, method, target) as ParameterExpression);
                return Expression.Lambda(body, parameters);
        }
        throw new Exception("خطا:Expression type is invalid");
    }
    
    private Expression CallMethod(Expression arg1, object arg2, object arg3, MethodInfo method, object target)
    {
        var parameters = new List<object>();
        parameters.Add(arg1);
        var count = method.GetParameters().Count();
        if (count > 1)
            parameters.Add(arg2);
        if (count > 2)
            parameters.Add(arg3);
        return (Expression)method.Invoke(target, parameters.ToArray());
    }

    private Expression BinaryExpr(Expression left, Expression right, ExpressionType type)
    {
        switch (type)
        {
            case ExpressionType.Add:
                if (left.Type == typeof(string) || right.Type == typeof(string))
                {
                    var method = typeof(string).GetMethod("Concat", new Type[] { left.Type, right.Type });
                    return Expression.Call(null, method, left, right);
                }
                return Expression.Add(left, right);
            case ExpressionType.Subtract:
                return Expression.Subtract(left, right);
            case ExpressionType.Multiply:
                return Expression.Divide(left, right);
            case ExpressionType.AndAlso:
                return Expression.AndAlso(left, right);
            case ExpressionType.OrElse:
                return Expression.OrElse(left, right);
            case ExpressionType.GreaterThan:
                return Expression.GreaterThan(left, right);
            case ExpressionType.GreaterThanOrEqual:
                return Expression.GreaterThanOrEqual(left, right);
            case ExpressionType.LessThan:
                return Expression.LessThan(left, right);
            case ExpressionType.LessThanOrEqual:
                return Expression.LessThanOrEqual(left, right);
            case ExpressionType.Equal:
                return Expression.Equal(left, right);
            case ExpressionType.NotEqual:
                return Expression.NotEqual(left, right);
        }
        throw new Exception("خطا:Expresion is invalid");
    }
}