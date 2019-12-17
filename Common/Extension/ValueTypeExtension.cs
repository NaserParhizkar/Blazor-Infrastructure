using Common.Extension;
using System;
using System.Globalization;

namespace Common
{
    public static class ValueTypeExtension
    {
        public static string Seprate3Digit(this int value)
        {
            return string.Format("{0:#,0}", value);
        }

        public static string Seprate3Digit(this long value)
        {
            return string.Format("{0:#,0}", value);
        }

        public static string Seprate3Digit(this int? value)
        {
            if (value.HasValue)
                return string.Format("{0:#,0}", value);
            return "";
        }

        public static string Seprate3Digit(this long? value)
        {
            if (value.HasValue)
                return string.Format("{0:#,0}", value);
            return "";
        }

        public static string LongString(this TimeSpan time)
        {
            var str = "";
            if (time.Hours < 10)
                str += "0";
            str += time.Hours.ToString() + ":";
            if (time.Minutes < 10)
                str += "0";
            str += time.Minutes;
            if (time.Seconds < 10)
                str += "0";
            str += time.Seconds;
            return str;
        }

        public static string ShortString(this TimeSpan time)
        {
            var str = "";
            if (time.Hours < 10)
                str += "0";
            str += time.Hours.ToString() + ":";
            if (time.Minutes < 10)
                str += "0";
            str += time.Minutes;
            return str;
        }

        public static string Seprate3Digit(this decimal value)
        {
            return string.Format("{0:#,0}", value);
        }

        public static string Seprate3Digit(this decimal? value)
        {
            if (value.HasValue)
            {
                var str = string.Format("{0:#,0}", value);
                return str;
            }
            return "";
        }

        public static PersianDate ToPersianDate(this DateTime date)
        {
            var calendar = new PersianCalendar();
            return new PersianDate(calendar.GetYear(date), (PersianMonth)calendar.GetMonth(date), calendar.GetDayOfMonth(date), date.Hour, 
                date.Minute, date.Second);
        }

        public static string ToPersianDateString(this DateTime date)
        {
            return date.ToPersianDate().ToString();
        }

        public static int? ConvertToInt(this Enum curentEnum)
        {
            if (curentEnum == null)
                return null;
            return Convert.ToInt32(curentEnum);
        }

        public static string ToPersianDateStringDayOfWeek(this DateTime date)
        {
            var pdate = date.ToPersianDate();
            return pdate.DayOfWeek.Text() + " " + pdate.ToString();
        }

        public static string ToPersianDateString(this DateTime? date)
        {
            if (date.HasValue)
                return date.Value.ToPersianDateString();
            return "";
        }

        public static string Text(this Enum field)
        {
            EnumFieldAttribute da;
            if (field == null)
                return null;
            var fi = field.GetType().GetField(field.ToString());
            if (fi == null)
                throw new Exception("هیچ فیلدی برای " + field.GetType().Name + " با مقدار " + field + " تعریف نشده است.");
            da = (EnumFieldAttribute)Attribute.GetCustomAttribute(fi, typeof(EnumFieldAttribute));
            if (da != null)
                return da.DisplayName;
            return Convert.ToString(field);
        }
    }
}
