using System;
using System.Linq;
using Common.Service;
using Newtonsoft.Json;
using Common.Extension;
using Microsoft.JSInterop;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.Rendering;

namespace MyComponent.UI
{
    public class Grid<TEntity> : ComponentBase where TEntity : class
    {
        private int? SelectedRowIndex { get; set; }

        public Grid()
        {
            Control = new TWindow<TEntity>();
            Data = Activator.CreateInstance<TEntity>();
        }

        [Inject, JsonIgnore]
        protected IJSRuntime jsRuntime { get; set; }

        [JsonIgnore]
        public object Ref { get; set; }

        [JsonIgnore]
        public TWindow<TEntity> Control { get; set; }

        [Parameter, JsonIgnore]
        public Func<IQueryable<TEntity>, IQueryable<TEntity>> OnDataBinding { get; set; }

        [JsonIgnore]
        public IList<TEntity> Items { get; set; } = new List<TEntity>();

        [JsonIgnore]
        public int Total { get; set; }

        [Parameter, JsonIgnore]
        public int PageNumber { get; set; } = 1;

        [Parameter, JsonIgnore]
        public bool SholdRendered { get; set; } = true;

        [JsonIgnore]
        public int PageSize { get; set; } = 5;

        [Parameter, JsonIgnore]
        public string Title { get; set; }

        [Inject, JsonIgnore]
        public ColumnAppState GridState { get; set; }

        [JsonIgnore]
        public TEntity Search { get; set; }

        [Parameter, JsonIgnore]
        public ISimpleService<TEntity> Service { get; set; }

        [Parameter, JsonIgnore]
        public TEntity Data { get; set; }

        [Parameter, JsonIgnore]
        public SelectType SelectType { get; set; } = SelectType.Single;

        [Parameter, JsonIgnore]
        public RenderFragment<TEntity> Columns { get; set; }

        protected override void OnInitialized()
        {
            this.Ref = this;
            base.OnInitialized();
        }

        protected override Task OnInitializedAsync()
        {
            this.Ref = this;
            return base.OnInitializedAsync();
        }

        [JsonIgnore]
        protected EventCallback<int> RowClick { get; set; }

        private void SelectRow(int rowIndex)
        {
            switch(SelectType)
            {
                case SelectType.Single:
                    SelectedRowIndex = rowIndex;
                    break;
                case SelectType.Multi:
                    break;
            }
        }

        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            if (GridState.InitializedState == InitializedState.GridColumnInitialized)
            {
                var data = Activator.CreateInstance<TEntity>();
                Columns(data).Invoke(builder);
            }
            else
            {
                builder.OpenElement(0, "div");                          //<div class="t-widget t-grid">
                builder.AddAttribute(0, "class", "t-widget t-grid");
                builder.OpenElement(0, "div");                              //<div class="t-Head">
                builder.AddAttribute(0, "class", "t-Head");
                builder.AddContent(0, Title);
                builder.CloseElement();                                     //</div>
                builder.OpenElement(0, "div");                              //<div class="class", "t-content">
                builder.AddAttribute(0, "class", "t-content");
                builder.OpenElement(1, "table");                                //<table cellpadding="0" cellspacing="0">
                builder.AddAttribute(1, "cellpadding", 0);
                builder.AddAttribute(1, "cellspacing", 0);
                builder.OpenElement(2, "tbody");                                    //<tbody>
                var index = 1;
                foreach (var item in Items)
                {
                    var rowIndex = index;
                    builder.OpenElement(3, "tr");                                       //<tr>
                    builder.AddAttribute(3, "onclick", EventCallback.Factory.Create<MouseEventArgs>(this, (e) =>
                    {
                        SelectRow(rowIndex);
                    }));
                    builder.AddContent<TEntity>(3, Columns, item);
                    builder.CloseElement();//tr                                         //</tr>
                    index++;
                }
                builder.CloseElement();                                             //<tbody>
                builder.CloseElement();                                         //<table>
                builder.CloseElement();                                     //</div>
                builder.OpenComponent<GridPager>(4);
                builder.AddComponentReferenceCapture(5, (object obj) =>
                {
                    var gridPager = obj as GridPager;
                    gridPager.TotalRecord = this.Total;
                    gridPager.PageSize = this.PageSize;
                    gridPager.PageNumber = PageNumber;
                    gridPager.PageNumberChanged = ChangePageNumber;
                });
                builder.CloseComponent();
                builder.AddElementReferenceCapture(0, t =>
                {
                    Ref = t;
                });
                builder.CloseElement();
            }
            base.BuildRenderTree(builder);
        }

        [JsonProperty("ids")]
        protected long[] Ids { get; set; }

        private void ChangePageNumber(int pageNumber)
        {
            this.PageNumber = pageNumber;
            this.OnParametersSetAsync();
            this.StateHasChanged();
        }

        protected override Task OnParametersSetAsync()
        {
            if (SholdRendered)
            {
                if (GridState.List.Count > 0)
                {
                    var exprList = new List<Expression>();
                    foreach (var item in GridState.List)
                        exprList.AddRange(new ExpressionSurvey().Survey(item));
                    var parameterExpr = Expression.Parameter(typeof(TEntity), "t");
                    var pKey = typeof(TEntity).GetPrimaryKey();
                    var expr = Expression.Property(parameterExpr, pKey);
                    exprList.Add(expr);
                    var query = Service.GetAll(Search);
                    if (OnDataBinding != null)
                        query = OnDataBinding.Invoke(query);
                    Total = query.Count();
                    if (PageNumber > 1)
                    {
                        var skip = (PageNumber - 1) * PageSize;
                        query = query.Skip(skip);
                    }
                    Items = query.Take(PageSize).GetValues<TEntity>(exprList);
                    GridState.InitializedState = InitializedState.FirstFetchData;
                    this.StateHasChanged();
                }
            }
            return base.OnParametersSetAsync();
        }

        public void Update()
        {
            this.Update(this.Data);
        }

        public void Update(TEntity model)
        {

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
            if (GridState.InitializedState == InitializedState.GridColumnInitialized)
            {
                GridState.InitializedState = InitializedState.GridFieldsIinitialized;
                this.OnParametersSetAsync();
            }
            else
            {

            }
            if (Items != null)
            {
                var pkey = typeof(TEntity).GetPrimaryKey();
                Ids = new long[Items.Count];
                int index = 0;
                foreach(var item in Items)
                {
                    Ids[index] = Convert.ToInt64(pkey.GetValue(item));
                    index++;
                }
            }
            var json = this.ConvertToJson();
            jsRuntime.InvokeVoidAsync("$.telerik.bindControl", Ref, json, UiControlType.Grid);
            return base.OnAfterRenderAsync(firstRender);
        }

        protected override bool ShouldRender()
        {
            if (!SholdRendered)
                return false;
            return base.ShouldRender();
        }
    }
}
