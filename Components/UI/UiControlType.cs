using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyComponent.UI
{
    public enum UiControlType
    {
        TextBox = 1,

        DropdownList,

        DatePicker,

        TimePicker,

        Window,

        Grid
    }

    public enum BindingType
    {
        OnChange = 1,

        OnInput
    }
}
