using System;

namespace Common.Extension
{
    public class EnumFieldAttribute : Attribute
    {
        public string DisplayName { get; private set; }

        public EnumFieldAttribute(string displayName)
        {
            DisplayName = displayName;
        }
    }
}
