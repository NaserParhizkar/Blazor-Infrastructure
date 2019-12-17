using System;
using Newtonsoft.Json;
using Common.Extension;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class NumericTextBox<TValue>: BaseInput<TValue>
    {
        [Parameter]
        public TValue MinValue { get; set; }

        [Parameter]
        public TValue MaxValue { get; set; }

        [Parameter, JsonProperty("digits")]
        public int NumberDigit { get; set; } = 2;

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(0, "class", "t-widget t-numerictextbox");
            builder.OpenElement(1, "input");
            builder.AddAttribute(1, "class", "t-input");
            if (Value != null)
                builder.AddAttribute(1, "value", Value);
            if (Id.HasValue())
            {
                builder.AddAttribute(1, "id", Id.Replace('.', '_'));
                builder.AddAttribute(1, "name", Id.Replace('.', '_'));
            }
            builder.AddElementReferenceCapture(1, t =>
            {
                input = t;
            });
            builder.CloseElement();
            builder.CloseElement();
            base.BuildRenderTree(builder);
        }

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            var type = typeof(TValue);
            if (type.IsNullableType())
                type = Nullable.GetUnderlyingType(type);
            if (type == typeof(int) || type == typeof(long) || type == typeof(short))
                NumberDigit = 0;
            var json = this.ConvertToJson();
            var data = new JsValueSetter(this);
            if (firstRender)
            {
                jsRuntime.InvokeVoidAsync("$.telerik.bindControl", input, json, UiControlType.TextBox);
                jsRuntime.InvokeAsync<object>("$.telerik.bindValue", DotNetObjectReference.Create(data), input, UiControlType.TextBox);
            }
            else
                jsRuntime.InvokeVoidAsync("$.telerik.updateState", input, json, UiControlType.TextBox);
            return base.OnAfterRenderAsync(firstRender);
        }
    }
}
