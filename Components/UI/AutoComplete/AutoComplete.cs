using Newtonsoft.Json;
using Common.Extension;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class AutoComplete<TValue> : ComponentBase
    {
        [Parameter, JsonIgnore]
        public RenderFragment<string> Template { get; set; }

        [Parameter, JsonProperty("bindingType")]
        public BindingType BindingType { get; set; } = BindingType.OnInput;

        [Inject, JsonIgnore]
        protected IJSRuntime jsRuntime { get; set; }

        [JsonIgnore]
        private ElementReference SearchForm;

        [Inject, JsonIgnore]
        public SearchState SearchState { get; set; }

        [JsonIgnore]
        private ElementReference Input;

        [Parameter, JsonIgnore]
        public TValue Value { get; set; }

        private TValue Oldvalue { get; set; }

        [Parameter, JsonIgnore]
        public EventCallback<TValue> ValueChanged { get; set; }

        [JsonIgnore]
        private string SearchStr { get; set; }

        [JsonIgnore]
        public string Id { get; set; }

        [Parameter, JsonProperty("openOnFocus")]
        public bool OpenOnFocus { get; set; }

        [Parameter, JsonProperty("closeOnBlur")]
        public bool CloseOnBlur { get; set; }

        [Parameter, JsonProperty("minCharForSearch")]
        public short? MinCharForSearch { get; set; }

        [JsonProperty("type")]
        public string TextBoxType { get; private set; } = "string";

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            ///TextBox 
            builder.OpenElement(0, "div");//                    <div class="t-widget t-numerictextbox">
            builder.AddAttribute(0, "class", "t-widget t-numerictextbox");
            builder.OpenElement(1, "input");//                      <input class="t-input" id="" name=""/>
            builder.AddAttribute(1, "class", "t-input");
            if (Id.HasValue())
            {
                builder.AddAttribute(1, "id", Id.Replace('.', '_'));
                builder.AddAttribute(1, "name", Id);
            }
            if (SearchState.DisplayExpression != null)
            {
                //builder.AddAttribute(1, "value", SearchState?.Text);
            }
            builder.AddElementReferenceCapture(1, t =>
            {
                Input = t;
                SearchState.Input = t;
            });
            builder.CloseElement();                                 //End close of input
            builder.OpenElement(1, "a");//                          <a href="javascript:void(0)">
            builder.AddAttribute(1, "href", "javascript:void(0)");
            builder.OpenElement(2, "span");//                           <span class="t-advancesearchicon">
            builder.AddAttribute(2, "class", "t-advancesearchicon");
            builder.CloseElement();//                                   </span>
            builder.CloseElement();//                               </a>
            builder.CloseElement();//                           </div>
                                   ///Serach form
            builder.OpenElement(0, "div");//                    <div class="t-HelpWindow">
            builder.AddAttribute(0, "class", "t-HelpWindow");
            builder.AddElementReferenceCapture(1, t =>
            {
                SearchForm = t;
                SearchState.SearchForm = t;
            });
            builder.OpenElement(1, "div");//                        <div class="t-header">
            builder.AddAttribute(1, "class", "t-header");
            builder.OpenElement(2, "a");//                              <a href="javascript:void(0)">
            builder.AddAttribute(2, "href", "javascript:void(0)");
            builder.OpenElement(3, "span");//                               <span class="t-close">
            builder.AddAttribute(3, "class", "t-close");
            builder.CloseElement();//3                                      </span>
            builder.CloseElement();//2                                  </a>
            builder.CloseElement();//1                              </div>
            builder.OpenElement(1, "div");//1                       <div class="t-content"> 
            builder.AddAttribute(0, "class", "t-content");
            builder.AddContent(1, Template, SearchStr);
            builder.CloseElement();//0                              </div>
            builder.CloseElement();//0                          </div>

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
            {
                jsRuntime.InvokeVoidAsync("$.telerik.bindLookup", Input, SearchForm, json);
                var data = new JsLookupValueSetter(this);
                jsRuntime.InvokeVoidAsync("$.telerik.bindLookupValue", DotNetObjectReference.Create(data), Input);
            }

            return base.OnAfterRenderAsync(firstRender);
        }
    }
}
