using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.Rendering;
using System;
using System.Linq;

namespace MyComponent.UI
{
    public class GridPager : ComponentBase
    {
        public int TotalRecord { get; set; }

        public int PageSize { get; set; }

        [Parameter]
        public int PageNumber { get; set; }

        public Action<int> PageNumberChanged { get; set; }

        public int PageCount
        {
            get
            {
                return (TotalRecord - 1) / PageSize + 1;
            }
        }

        private void ChangePageNumber(int pageNumber)
        {
            PageNumber = pageNumber;
            PageNumberChanged.Invoke(pageNumber);
        }

        public void BuildTree(RenderTreeBuilder builder)
        {
            BuildRenderTree(builder);
        }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(0, "class", "t-grid-pager t-grid-bottom");
            builder.OpenElement(1, "div");
            builder.AddAttribute(1, "class", "t-pager t-reset");
            ///////<a>
            builder.OpenElement(2, "a");
            var className = "t-link";
            if (PageNumber == 1)
                className += " t-state-disabled";
            builder.AddAttribute(2, "class", className);
            builder.AddAttribute(2, "href", "#");
            builder.AddAttribute(2, "tabindex", "-1");
            builder.OpenElement(3, "span");
            builder.AddAttribute(3, "class", "t-icon t-arrow-first");
            builder.CloseElement();//3 span
            builder.CloseElement();//2 a
            builder.OpenElement(2, "a");
            builder.AddAttribute(2, "class", className);
            builder.AddAttribute(2, "href", "#");
            builder.AddAttribute(2, "tabindex", "-1");
            builder.OpenElement(3, "span");
            builder.AddAttribute(3, "class", "t-icon t-arrow-prev");
            builder.CloseElement();//3 span
            builder.CloseElement();//2 a
            builder.OpenElement(2, "div");
            builder.AddAttribute(2, "class", "t-numeric");
            for (var index = 1; index <= PageCount; index++)
            {
                var pageNumber = index;
                if (index == PageNumber)
                {
                    builder.OpenElement(3, "span");
                    builder.AddAttribute(3, "class", "t-state-active");
                    builder.AddContent(3, index);
                    builder.CloseElement();
                }
                else
                {
                    builder.OpenElement(3, "a");
                    builder.AddAttribute(3, "class2", index);
                    builder.AddAttribute(3, "class", "t-link");
                    builder.AddAttribute(4, "onclick", EventCallback.Factory.Create<MouseEventArgs>(this,
                        (e) => {
                            ChangePageNumber(pageNumber);
                        }));
                    builder.AddContent(3, index);
                    builder.CloseElement();
                }
            }
            if (PageCount > 8)
            {
                builder.OpenElement(3, "a");
                builder.AddAttribute(3, "class", "t-link");
                builder.AddContent(3, "...");
                builder.CloseElement();
            }
            builder.CloseElement();//1 div
            builder.CloseElement();//2 div
            //-----------------------------------------------------------------
            builder.OpenElement(2, "div");
            builder.AddAttribute(2, "class", "t-status-text");
            var startRowIndex = (PageNumber - 1) * PageSize + 1;
            builder.AddContent(2, "نمایش ردیف های " + startRowIndex + "-" + (startRowIndex + PageSize - 1) + " از " + TotalRecord + " ردیف");
            builder.CloseElement();//2 div
            builder.CloseElement();//0 div
            base.BuildRenderTree(builder);
        }
    }
}
