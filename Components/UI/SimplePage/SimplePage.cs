using System;
using Common;
using System.Linq;
using Common.Service;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Server.Circuits;
using System.Threading;

namespace MyComponent.UI
{
    public class SimplePage<TEntity> : OwningComponentBase where TEntity : class
    {
        public SimplePage()
        {
            
        }
        public Grid<TEntity> Grid { get; set; }

        [Inject]
        public AppState AppState { get; set; }

        [Inject]
        public MyContext Context { get; set; }

        protected override Task OnInitializedAsync()
        {
            AppState.OnChange += StateHasChanged;
            var infos = this.GetType().GetProperties(BindingFlags.NonPublic | BindingFlags.Instance).Where(t => t.GetCustomAttribute<InjectAttribute>() != null);
            if (Context.IsDisposed)
                Context = Activator.CreateInstance(Context.GetType()) as MyContext;
            foreach (var info in infos)
            {
                if (info.GetValue(this) is IEntity entityService)
                    entityService.Context = Context;
            }
            return base.OnInitializedAsync();
        }

        protected virtual void OnDataBinding(IQueryable<TEntity> query)
        {
            Grid.OnDataBinding(query);
        }

        protected override void Dispose(bool disposing)
        {
            Context?.Dispose();
            base.Dispose(disposing);
        }
    }

    public class Test: CircuitHandler
    {
        public override Task OnCircuitOpenedAsync(Circuit circuit, CancellationToken cancellationToken)
        {
            
            return base.OnCircuitOpenedAsync(circuit, cancellationToken);
        }
    }
}
