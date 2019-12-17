using System;
using System.Linq;
using Common.Extension;

namespace MyComponent.UI
{
    public class MasterDetails<TMaster, TDetails>: SimplePage<TDetails> where TDetails : class
    {
        public TMaster Master { get; set; }

        protected override void OnDataBinding(IQueryable<TDetails> query)
        {
            base.OnDataBinding(query);
        }

        private void InitialForeigenKeyId()
        {
            var infos = typeof(TDetails).GetProperties().Where(t => t.PropertyType == typeof(TMaster));
            if (infos.Count() != 1)
                throw new Exception("خطا:Type " + typeof(TDetails).Name + " must a property of type " + 
                    typeof(TMaster).Name);
            var pKeyId = typeof(TMaster).GetPrimaryKey().GetValue(Master);
            infos.Single().SetValue(this.Grid.Search, pKeyId);
        }
    }
}
