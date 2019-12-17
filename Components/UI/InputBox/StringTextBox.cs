using Newtonsoft.Json;
using Common.Extension;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.Components.Web;

namespace MyComponent.UI
{
    public class StringTextBox: BaseInput<string>
    {
        [Parameter, JsonIgnore]
        public int? MaxLength { get; set; }

        [Parameter, JsonProperty("multiLine")]
        public bool MultiLine { get; set; }

        [Parameter, JsonIgnore]
        public int? Cols { get; set; }

        [Parameter, JsonIgnore]
        public int? Rows { get; set; }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "div");
            var className = "t-widget";
            if (MultiLine)
                className += " t-multitextbox";
            else
                className += " t-numerictextbox";
            if (Disabled)
                className += " t-state-disabled";
            builder.AddAttribute(0, "class", className);
            if (Style.HasValue())
                builder.AddAttribute(1, "style", Style);
            if (MultiLine)
                builder.OpenElement(1, "textarea");
            else
                builder.OpenElement(1, "input");
            if (Id.HasValue())
            {
                builder.AddAttribute(1, "id", Id.Replace('.', '_'));
                builder.AddAttribute(1, "name", Id.Replace('.', '_'));
            }
            builder.AddAttribute(1, "class", "t-input");
            builder.AddAttribute(0, "onclick", OnClick);
            if (Disabled)
                builder.AddAttribute(1, "disabled", "disabled");
            //if (MultiLine)
            //{
            //    if (Cols.HasValue)
            //        builder.AddAttribute(1, "cols", Cols.Value);
            //    if (Rows.HasValue)
            //        builder.AddAttribute(1, "rows", Rows.Value);
            //    if (Value != null)
            //        builder.AddContent(1, Value);
            //}
            //else
            //{
            //    if (Value != null)
            //        builder.AddAttribute(1, "value", Value);
            //}

            builder.AddElementReferenceCapture(1, t =>
            {
                input = t;
            });
            
            builder.CloseElement();
            builder.CloseElement();
        }

        [JsonProperty("type")]
        public string Type { get; set; } = "string";

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            var json = this.ConvertToJson();
            var data = new JsValueSetter(this);
            if (firstRender)
            {
                jsRuntime.InvokeVoidAsync("$.telerik.bindControl", input, json, UiControlType.TextBox);
                jsRuntime.InvokeVoidAsync("$.telerik.bindValue", DotNetObjectReference.Create(data), input, UiControlType.TextBox);
            }
            else
                jsRuntime.InvokeVoidAsync("$.telerik.updateState", input, json, UiControlType.TextBox);
            return base.OnAfterRenderAsync(firstRender);
        }
    }
}
