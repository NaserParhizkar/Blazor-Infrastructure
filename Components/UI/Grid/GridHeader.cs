using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class GridHeader : ComponentBase
    {
        public GridHeader()
        {
            Columns = new List<GridHeaderData>();
        }

        [Parameter]
        public string Test { get; set; }

        [Parameter]
        public EventCallback<string> TestChanged { get; set; }

        internal List<GridHeaderData> Columns { get; set; }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(0, "class", "t-grid-header");
            builder.OpenElement(1, "div");
            builder.AddAttribute(1, "class", "t-grid-header-wrap");
            builder.OpenElement(2, "table");
            builder.OpenElement(3, "tbody");
            builder.OpenElement(4, "tr");
            foreach (var col in Columns)
            {
                builder.OpenElement(5, "th");
                builder.AddAttribute(5, "class", "t-header");
                if (col.Width.HasValue)
                    builder.AddAttribute(5, "style", "width:" + col.Width + "px");
                builder.AddContent(5, col.Title);
                builder.CloseElement();//th
            }
            builder.CloseElement();//tr
            builder.CloseElement();//tbody
            builder.CloseElement(); //table
            builder.CloseElement(); //div
            builder.CloseElement(); //div
            base.BuildRenderTree(builder);
        }
    }
}
