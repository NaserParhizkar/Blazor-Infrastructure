namespace Common.Extension
{
    public static class StringExtension
    {
        public static bool HasValue(this string str)
        {
            return !string.IsNullOrEmpty(str);
        }
    }
}
