using Microsoft.JSInterop;

namespace MyComponent.UI
{
    public class JsLookupValueSetter
    {
        private readonly object Lookup;
        public JsLookupValueSetter(object lookup)
        {
            Lookup = lookup;
        }

        [JSInvokable]
        public void UpdateSearchValue(string text)
        {
            Lookup.GetType().GetMethod("UpdateSearch").Invoke(Lookup, new object[] { text});
        }

        [JSInvokable]
        public void UpdateValue(int value)
        {
            var info = Lookup.GetType().GetProperty("ValueChanged");
            var valueChanged = info.GetValue(Lookup);
            var method = valueChanged.GetType().GetMethod("InvokeAsync");
            method.Invoke(valueChanged, new object[] { value });
        }
    }
}
