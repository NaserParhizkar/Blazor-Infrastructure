using System;
using System.Linq;
using Newtonsoft.Json;
using Common.Extension;
using System.Reflection;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class DropdownList<TValue>: BaseInput<TValue>
    {
        private IEnumerable<FieldInfo> GetFields()
        {
            var type = typeof(TValue);
            if (type.IsNullableType())
                type = Nullable.GetUnderlyingType(type);
            return type.GetFields().Where(t => !t.IsSpecialName);
        }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            string text = "لطفا انتخاب نمائید", value = null;
            //var field = GetFields().SingleOrDefault(t => t.GetValue(null).Equals(Value));
            //if (Value != null)
            //{
            //    var attr = field.GetCustomAttribute<EnumFieldAttribute>();
            //    text = attr == null ? field.Name : attr.DisplayName;
            //    value = Convert.ToInt32(Value).ToString();
            //}
            ///<div class="t-widget t-dropdown t-header" style="width:214px;">0
            builder.OpenElement(0, "div");
            var className = "t-widget t-dropdown t-header";
            builder.AddAttribute(0, "class", className);
            if (Style == null)
                builder.AddAttribute(0, "style", Style);
            ///<div class="t-dropdown-wrap t-state-default">1
            builder.OpenElement(1, "div");
            className = "t-dropdown-wrap";
            if (Disabled)
                className += " t-state-disabled";
            else
                className += " t-state-default";
            builder.AddAttribute(1, "class", className);
            ///<span class="t-input">text</span>2
            builder.OpenElement(2, "span");
            builder.AddAttribute(2, "class", "t-input");
            builder.AddContent(2, text);
            builder.CloseElement();//-----------2
            ///<span class="t-select">2
            builder.OpenElement(2, "span");
            builder.AddAttribute(2, "class", "t-t-select");
            ///<span class="t-icon t-arrow-down">
            builder.OpenElement(3, "span");
            builder.AddAttribute(3, "class", "t-icon t-arrow-down");
            builder.CloseElement();//3
            builder.CloseElement();//2
            ///<span class="t-star">
            builder.OpenElement(2, "span");            
            builder.AddAttribute(2, "class", "t-star");
            builder.AddContent(2, "*");
            builder.CloseElement();//2
            builder.CloseElement();//1
            ///<input autocomplete="off" id="" name="" style="display:none" value="1">
            builder.OpenElement(1, "input");
            builder.AddAttribute(1, "autocomplete", "autocomplete");
            if (Id.HasValue())
            {
                builder.AddAttribute(1, "id", Id.Remove('.', '_'));
                builder.AddAttribute(1, "name", Id);
            }
            //if (Value != null)
            //    builder.AddAttribute(1, "value", value);
            builder.AddAttribute(1, "style", "display:none");
            builder.AddElementReferenceCapture(1, t =>
            {
                input = t;
            });
            builder.CloseElement();//1
            builder.CloseElement();//0
            base.BuildRenderTree(builder);
        }

        [JsonProperty("data")]
        public List<SelectListItem> Items { get; set; }

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            Items = new List<SelectListItem>();
            if (typeof(TValue).IsNullableType())
            {
                Items.Add(new SelectListItem()
                {
                    Text = "لطفا انتخاب نمائید",
                    Value = null
                });
            }
            foreach (var field in GetFields())
            {
                var attr = field.GetCustomAttribute<EnumFieldAttribute>();
                Items.Add(new SelectListItem()
                {
                    Text = attr == null ? field.Name : attr.DisplayName,
                    Value = Convert.ToInt32(field.GetValue(null)).ToString()
                });
            }
            var json = this.ConvertToJson();
            var data = new JsValueSetter(this);
            if (firstRender)
            {
                jsRuntime.InvokeVoidAsync("$.telerik.bindControl", input, json, UiControlType.DropdownList);
                jsRuntime.InvokeAsync<object>("$.telerik.bindValue", DotNetObjectReference.Create(data), input, UiControlType.DropdownList);
            }
            else
                jsRuntime.InvokeVoidAsync("$.telerik.updateState", input, json, UiControlType.DropdownList);
            return base.OnAfterRenderAsync(firstRender);
        }
    }
}
