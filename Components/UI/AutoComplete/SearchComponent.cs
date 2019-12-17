using System;
using Common;
using System.Linq;
using Common.Service;
using Common.Extension;
using System.Reflection;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Linq.Dynamic.Core;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class SearchComponent<TEntity> : OwningComponentBase where TEntity : class
    {
        public string SearchString { get; set; }

        public Grid<TEntity> Grid { get; set; }

        private ISimpleService<TEntity> Service;

        [Inject, JsonIgnore]
        public MyContext Context { get; set; }

        [JsonIgnore, Parameter]
        public TEntity SelectedObject { get; set; }

        [Inject, JsonIgnore]
        protected IJSRuntime jsRuntime { get; set; }

        [Inject, JsonIgnore]
        public SearchState SearchState { get; set; }

        [Parameter, JsonIgnore]
        public Expression<Func<TEntity, string>> DisplayTextExpression { get; set; }

        public void UpdateSearch(string str)
        {
            this.SearchString = str;
            StateHasChanged();
        }

        protected override Task OnInitializedAsync()
        {
            if (Context.IsDisposed)
                Context = Activator.CreateInstance(Context.GetType()) as MyContext;
            var infos = this.GetType().GetProperties(BindingFlags.NonPublic | BindingFlags.Instance).Where(t => t.GetCustomAttribute<InjectAttribute>() != null);
            foreach (var info in infos)
            {
                if (info.GetValue(this) is IEntity entityService)
                    entityService.Context = Context;
                if (info.PropertyType.GetInterfaces().Any(t => t == typeof(ISimpleService<TEntity>)))
                    Service = info.GetValue(this) as ISimpleService<TEntity>;
            }
    
            return base.OnInitializedAsync();
        }

        protected override void OnParametersSet()
        {
            SearchState.Service = Service;
            SearchState.DisplayExpression = DisplayTextExpression;
            base.OnParametersSet();
        }

        protected override Task OnAfterRenderAsync(bool firstRender)
        {
            var data = new JsLookupValueSetter(this);
            jsRuntime.InvokeVoidAsync("$.telerik.bindLookupSearchValue", DotNetObjectReference.Create(data), SearchState.Input);
            return base.OnAfterRenderAsync(firstRender);
        }

        protected override void Dispose(bool disposing)
        {
            Context?.Dispose();
            base.Dispose(disposing);
        }

        protected void InitialTextExpression(Expression<Func<TEntity, string>> expression)
        {
            if (DisplayTextExpression == null)
                DisplayTextExpression = expression;
        }
    }
}
