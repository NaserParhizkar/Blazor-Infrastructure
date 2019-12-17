using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;

namespace MyComponent.UI
{
    public class GridCommandColumns : ComponentBase
    {
        [Parameter]
        public bool DisableEdit { get; set; }

        [Parameter]
        public bool DisableDelete { get; set; }

        [Parameter]
        public bool HideEdit { get; set; }

        [Parameter]
        public bool HideDelete { get; set; }

        [Parameter]
        public string HeaderTitle { get; set; }

        [Inject]
        public ColumnAppState GridState { get; set; }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            if (GridState.InitializedState == InitializedState.FirstFetchData)
            {
                builder.OpenElement(0, "td");//<td>
                if (!HideEdit)
                {
                    builder.OpenElement(1, "a");//<a tabindex="-1" href="javascript:void(0)">
                    builder.AddAttribute(1, "tabindex", "-1");
                    var className = "t-grid-edit";
                    if (DisableEdit)
                        className += " t-state-disabled";
                    builder.AddAttribute(1, "class", className);
                    builder.AddAttribute(1, "href", "javascript:void(0)");
                    builder.OpenElement(2, "span");//<span>
                    builder.AddAttribute(2, "class", "t-icon t-edit");
                     builder.CloseElement();//</span>
                    builder.CloseElement();//</a>
                }
                if (!HideDelete)
                {
                    builder.OpenElement(1, "a");//<a tabindex="-1" href="javascript:void(0)">
                    builder.AddAttribute(1, "tabindex", "-1");
                    var className = "t-grid-delete";
                    if (DisableDelete)
                        className += " t-state-disabled";
                    builder.AddAttribute(1, "class", className);
                    builder.AddAttribute(1, "href", "javascript:void(0)");
                    builder.OpenElement(2, "span");//<span>
                    builder.AddAttribute(2, "class", "t-icon t-delete");
                    builder.CloseElement();//</span>
                    builder.CloseElement();//</a>
                }
                builder.CloseElement();//</td>
            }
            base.BuildRenderTree(builder);
        }

        protected override void OnParametersSet()
        {
            base.OnParametersSet();
        }
    }
}
