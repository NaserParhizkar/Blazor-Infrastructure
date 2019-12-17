using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;

namespace MyComponent.UI
{
    public class SearchState
    {
        public ElementReference SearchForm { get; set; }

        public ElementReference Input { get; set; }

        public object Service { get; set; }

        public Expression DisplayExpression { get; set; }
    }
}
