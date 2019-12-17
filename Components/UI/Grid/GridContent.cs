using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class GridContent<TModel> : ComponentBase
    {
        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(0, "class", "t-Content");
            builder.CloseElement();
            base.BuildRenderTree(builder);
        }
    }
}
