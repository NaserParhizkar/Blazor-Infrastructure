using Newtonsoft.Json;
using Common.Extension;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class TWindow<TModel> : ComponentBase
    {
        protected ElementReference window;

        [Inject]
        protected IJSRuntime jsRuntime { get; set; }

        [Parameter, JsonIgnore]
        public string Id { get; set; }

        [Parameter, JsonIgnore]
        public string Style { get; set; }

        public TWindow()
        {

        }

        [Parameter, JsonProperty("title")]
        public string Title { get; set; }

        [Parameter, JsonIgnore]
        public RenderFragment<TModel> Content { get; set; }

        [Parameter, JsonProperty("status")]
        public WindowStatus Status { get; set; } = WindowStatus.Close;

        [Parameter, JsonProperty("modal")]
        public bool Modal { get; set; } = true;

        [Parameter, JsonProperty("resizable")]
        public bool Resizable { get; set; }

        [Parameter, JsonProperty("draggable")]
        public bool Draggable { get; set; }

        [Parameter, JsonIgnore]
        public TModel BaseOBject { get; set; }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.OpenElement(0, "div");
            builder.AddAttribute(0, "class", "t-widget t-window");
            if (Style.HasValue())
                builder.AddAttribute(0, "style", Style);
            builder.OpenElement(1, "div");
            builder.AddAttribute(1, "class", "t-window-titlebar t-header");
            builder.OpenElement(2, "span");
            builder.AddAttribute(2, "class", "t-window-title");
            builder.AddContent(2, Title);
            builder.CloseElement();//2
            builder.OpenElement(2, "div");
            builder.AddAttribute(2, "class", "t-window-actions t-header");
            builder.OpenElement(3, "a");
            builder.AddAttribute(3, "class", "t-window-action t-link");
            builder.AddAttribute(3, "href", "javascript: void(0)");
            builder.OpenElement(4, "span");
            builder.AddAttribute(4, "class", "fa fa-times");
            builder.CloseElement();//4
            builder.CloseElement();//3
            builder.CloseElement();//2
            builder.CloseElement();//1
            builder.OpenElement(1, "div");
            builder.AddAttribute(1, "class", "t-window-content t-content");
            builder.AddContent<TModel>(1, Content, BaseOBject);
            builder.CloseElement();//1
            builder.AddElementReferenceCapture(0, t =>
            {
                window = t;
            });
            if (Modal)
            {
                builder.CloseElement();//0
                builder.OpenElement(0, "div");
                builder.AddAttribute(0, "class", "t-overlay");
                builder.CloseElement();
            }
            base.BuildRenderTree(builder);
        }

        protected string ConvertToJson()
        {
            var setting = new JsonSerializerSettings()
            {
                NullValueHandling = NullValueHandling.Ignore,
                DefaultValueHandling = DefaultValueHandling.Ignore
            };
            return JsonConvert.SerializeObject(this, setting);
        }

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            var json = this.ConvertToJson();
            if (firstRender)
                jsRuntime.InvokeVoidAsync("$.telerik.bindControl", window, json, UiControlType.Window);
            else
                jsRuntime.InvokeVoidAsync("$.telerik.updateState", window, json, UiControlType.Window);
            return base.OnAfterRenderAsync(firstRender);
        }
    }
}
