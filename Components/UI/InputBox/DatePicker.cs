using Newtonsoft.Json;
using Common.Extension;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using System;
using Common;

namespace MyComponent.UI
{
    public class DatePicker<TValue>: BaseInput<TValue>
    {
        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(0, "class", "t-widget t-datepicker");
            builder.OpenElement(1, "div");
            builder.AddAttribute(1, "class", "t-picker-wrap");
            builder.OpenElement(2, "input");
            builder.AddAttribute(2, "autocomplete", "off");
            builder.AddAttribute(2, "class", "t-input");
            //if (Value != null)
            //{
            //    var date = DateTime.Parse(Value.ToString()).ToPersianDateString().Split(' ')[0];
            //    builder.AddAttribute(2, "value", date);
            //}
            if (Id.HasValue())
            {
                builder.AddAttribute(2, "id", Id.Replace('.', '_'));
                builder.AddAttribute(2, "name", Id.Replace('.', '_'));
            }
            builder.AddElementReferenceCapture(2, t =>
            {
                input = t;
            });
            builder.CloseElement();//2
            builder.OpenElement(2, "span");
            builder.AddAttribute(2, "class", "t-select");
            builder.AddAttribute(2, "style", "left:inherit");
            builder.OpenElement(3, "span");
            builder.AddAttribute(3, "class", "t-icon t-icon-calendar");
            builder.AddAttribute(3, "title", "تقویم شمسی");
            builder.CloseElement();//3
            builder.CloseElement();//2
            builder.CloseElement();//1
            builder.CloseElement();//0
        }

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            var json = this.ConvertToJson();
            var data = new JsValueSetter(this);
            if (firstRender)
            {
                jsRuntime.InvokeVoidAsync("$.telerik.bindControl", input, json, UiControlType.DatePicker);
                jsRuntime.InvokeAsync<object>("$.telerik.bindValue", DotNetObjectReference.Create(data), input, UiControlType.DatePicker);
            }
            else
                jsRuntime.InvokeAsync<object>("$.telerik.updateState", input, json, UiControlType.DatePicker);
            return base.OnAfterRenderAsync(firstRender);
        }
    }
}
