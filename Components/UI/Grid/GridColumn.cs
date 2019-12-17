using System;
using System.Linq.Expressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class GridColumn<TEntity> : ComponentBase
    {
        [Parameter]
        public Expression<Func<TEntity, object>> Field { get; set; }

        [Parameter]
        public RenderFragment ChildContent { get; set; }

        [Parameter]
        public TEntity Data { get; set; }

        [Parameter]
        public string Style { get; set; }

        [Inject]
        public ColumnAppState GridState { get; set; }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            if (GridState.InitializedState == InitializedState.FirstFetchData)
            {
                builder.OpenElement(0, "td");
                if (Style != null)
                    builder.AddAttribute(0, "style", Style);
                if (ChildContent == null)
                {
                    var value = Field.Compile().DynamicInvoke(Data);
                    builder.AddContent(1, value);
                }
                else
                    builder.AddContent(0, ChildContent);
                builder.CloseElement();
            }
            base.BuildRenderTree(builder);
        }

        protected override void OnParametersSet()
        {
            if (GridState.InitializedState == InitializedState.GridColumnInitialized && Field != null)
                GridState.List.Add(Field.Body);
            base.OnParametersSet();
        }
    }
}
