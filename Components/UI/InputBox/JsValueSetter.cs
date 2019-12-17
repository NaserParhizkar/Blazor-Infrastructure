using System;
using System.Threading.Tasks;
using Common.Extension;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;

namespace MyComponent.UI
{
    public class JsValueSetter
    {
        private readonly object stringTextBox;
        public JsValueSetter(object textBox)
        {
            stringTextBox = textBox;
        }

        public string Value { get; set; }

        [JSInvokable]
        public void SetStringValue(string value)
        {
            var info = stringTextBox.GetType().GetProperty("ValueChanged");
            var valueChanged = info.GetValue(stringTextBox);
            var method = valueChanged.GetType().GetMethod("InvokeAsync");
            EventCallback<int> a;
            method.Invoke(valueChanged, new object[] { value });
        }

        [JSInvokable]
        public void SetValue(decimal? value)
        {
            var info = stringTextBox.GetType().GetProperty("ValueChanged");
            var valueChanged = info.GetValue(stringTextBox);
            var method = valueChanged.GetType().GetMethod("InvokeAsync");
            var type = method.GetParameters()[0].ParameterType;
            if (value.HasValue || type.IsNullableType())
            {
                if (value.HasValue && type.IsNullableType())
                    type = Nullable.GetUnderlyingType(type);
                object convertedValue = value;
                if (convertedValue != null)
                {
                    if (type.IsEnum)
                        convertedValue = Enum.Parse(type, value.ToString());
                    else
                        convertedValue = Convert.ChangeType(convertedValue, type);
                }
                stringTextBox.GetType().GetProperty("Value").SetValue(stringTextBox, convertedValue);
                (method.Invoke(valueChanged, new object[] { convertedValue }) as Task).Wait();
            }
        }

        [JSInvokable]
        public void SetEnumValue(int? value)
        {

        }

        [JSInvokable]
        public void SetLookupValue(long value)
        {

        }
    }
}
