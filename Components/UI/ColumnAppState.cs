using System;
using System.Linq.Expressions;
using System.Collections.Generic;

namespace MyComponent.UI
{
    public class ColumnAppState
    {
        public Action<Expression> AddToListAction { get; set; }

        public InitializedState InitializedState { get; set; }

        public IList<Expression> List { get; set; } = new List<Expression>();
    }
}
