using Newtonsoft.Json;
using Microsoft.JSInterop;
using Microsoft.AspNetCore.Components;
using System;
using Microsoft.AspNetCore.Components.Web;

namespace MyComponent.UI
{
    public class BaseInput<TValue>: ComponentBase
    {
        protected ElementReference input;

        [Inject]
        protected IJSRuntime jsRuntime { get; set; }

        [Parameter, JsonIgnore]
        public string Id { get; set; }

        [Parameter, JsonIgnore]
        public string Style { get; set; }

        [Parameter, JsonProperty("disabled")]
        public bool Disabled { get; set; }

        [Parameter, JsonProperty("focused")]
        public bool Focused { get; set; }

        [Parameter, JsonIgnore]
        public TValue Value { get; set; }

        [Parameter, JsonIgnore]
        public EventCallback<TValue> ValueChanged { get; set; }

        [Parameter]
        public EventCallback<ProgressEventArgs> OnAbort { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnActivate { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnBeforeActivate { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnBeforeCopy { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnClick { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnMouseDown { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnMouseMove { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnMouseOut { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnMouseOver { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnMouseUp { get; set; }

        [Parameter]
        public EventCallback<MouseEventArgs> OnMouseWheel { get; set; }

        protected string ConvertToJson()
        {
            
            var setting = new JsonSerializerSettings()
            {
                NullValueHandling = NullValueHandling.Ignore,
                DefaultValueHandling = DefaultValueHandling.Ignore
            };
            return JsonConvert.SerializeObject(this, setting);
        }
    }
}
