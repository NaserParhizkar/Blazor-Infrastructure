using Common.Extension;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;

namespace Common
{
    [ComplexType]
    public class PersianDate
    {
        public PersianDate()
        { 
        
        }

        public static PersianDate Now
        {
            get
            {
                return DateTime.Now.ToPersianDate();
            }
        }

        public static int? operator -(PersianDate param1, PersianDate param2)
        {
            if (param1.IsNull || param2.IsNull)
                return null;
            var date1 = new PersianCalendar().ToDateTime(param1.Year.Value, (int)param1.Month.Value, param1.Day.Value, 0, 0, 0, 0);
            var date2 = new PersianCalendar().ToDateTime(param2.Year.Value, (int)param2.Month.Value, param2.Day.Value, 0, 0, 0, 0);
            return (date1 - date2).Days;
        }

        public static bool operator >(PersianDate param1, PersianDate param2)
        {
            if (param1.Year > param2.Year)
                return true;
            if (param1.Year == param2.Year)
            {
                if (param1.Month > param2.Month)
                    return true;
                if (param1.Month == param2.Month && param1.Day > param2.Day)
                    return true;

            }
            return false;
        }

        public static bool operator >=(PersianDate param1, PersianDate param2)
        {
            if (param1.Year > param2.Year)
                return true;
            if (param1.Year == param2.Year)
            {
                if (param1.Month > param2.Month)
                    return true;
                if (param1.Month == param2.Month && param1.Day >= param2.Day)
                    return true;

            }
            return false;
        }

        public static bool operator <(PersianDate param1, PersianDate param2)
        {
            if (param1.Year < param2.Year)
                return true;
            if (param1.Year == param2.Year)
            {
                if (param1.Month < param2.Month)
                    return true;
                if (param1.Month == param2.Month && param1.Day < param2.Day)
                    return true;

            }
            return false;
        }

        public static bool operator <=(PersianDate param1, PersianDate param2)
        {
            if (param1.Year < param2.Year)
                return true;
            if (param1.Year == param2.Year)
            {
                if (param1.Month < param2.Month)
                    return true;
                if (param1.Month == param2.Month && param1.Day <= param2.Day)
                    return true;

            }
            return false;
        }

        public PersianDate FirstDayOfYear()
        {
            if (!Year.HasValue)
                return null;
            return new PersianDate(Year.Value, PersianMonth.Farvardin, 1);
        }

        public bool IsNull
        {
            get { return string.IsNullOrEmpty(Date); }
        }

        public bool HasValue
        {
            get { return !IsNull; }
        }

        private string[] _DayOfMonth = new string[]
        { 
            "یکم", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم", "دهم",
            "یازدهم", "دوازدهم", "سیزدهم", "چهاردهم", "پانزدهم", "شانزدهم", "هفدهم", "هجدهم", "نوزدهم", "بیستم", 
            "بیست یکم", "بیست دوم", "بیست سوم", "بیست چهارم", "بیست پنجم", "بیست ششم", "بیست هفتم", "بیست هشتم", 
            "بیست نهم", "سی ام", "سی یکم"
        };

        public string Date { get; set; }

        public void CheckDate()
        { 
        
        }

        public PersianDate LastDayOfYear()
        {
            if (!Year.HasValue)
                return null;
            if (new PersianCalendar().IsLeapYear(Year.Value))
                return new PersianDate(Year.Value, PersianMonth.Esfand, 30);
            return new PersianDate(Year.Value, PersianMonth.Esfand, 29);
        }

        public PersianDate(int year, PersianMonth month, int day)
        {
            if (year < 1300)
                year += 1300;
            Date = year.ToString() + '/';
            if ((int)month < 10)
                Date += '0';
            Date += ((int)month).ToString() + '/';
            if (day < 10)
                Date += '0';
            Date += day.ToString();
        }

        public PersianDate(int year, PersianMonth month, int day, int hour, int minutes, int second)
        {
            if (year < 1300)
                year += 1300;
            Date = year.ToString() + '/';
            if ((int)month < 10)
                Date += '0';
            Date += ((int)month).ToString() + '/';
            if (day < 10)
                Date += '0';
            Date += day.ToString();
            if (hour != 0 || minutes != 0 || second != 0)
            {
                Date += "  ";
                if (hour < 10)
                    Date += '0';
                Date += hour.ToString() + ":";
                if (minutes < 10)
                    Date += '0';
                Date += minutes.ToString() + ":";
                if (second < 10)
                    Date += '0';
                Date += second.ToString();
            }
        }

        public PersianDate(string str)
        {
            Date = str;
        }

        /// <summary>
        /// YYYY/MM/DD یا YYYY/MM/DD HH:MM
        /// </summary>
        /// <returns></returns>
        public static DateTime ConvertStringToDateTime(string str)
        {
            if(string.IsNullOrEmpty(str) || string.IsNullOrWhiteSpace(str))
            {
                return DateTime.MinValue;
            }
            PersianCalendar p = new PersianCalendar();
            DateTime dta1 = new DateTime();
            string[] parts = str.Split(' ');
            if(parts.Length == 1) {
                string[] parts2 = parts[0].Split('/', '-');
                dta1 = p.ToDateTime(Convert.ToInt32(parts2[0]), Convert.ToInt32(parts2[1]), Convert.ToInt32(parts2[2]), 0, 0, 0, 0);
            }
            else if(parts.Length == 2) { 
                string[] date = parts[0].Split('/', '-');
                string[] time = parts[1].Split(':');
                dta1 = p.ToDateTime(Convert.ToInt32(date[0]), Convert.ToInt32(date[1]), Convert.ToInt32(date[2]), Convert.ToInt32(time[0]), Convert.ToInt32(time[1]), 0, 0);
            }
            return dta1;
        }


        public int? GetAllDayes()
        {
            if (!Year.HasValue || !Month.HasValue || !Day.HasValue)
                return null;
            int day = Year.Value * 365;
            day += (int)Month.Value * 30;
            day += (int)Month.Value;
            day += Day.Value;
            return day;
        }

        public DateTime? GetMiladyDate()
        {
            return MiladyDate;
        }

        /// <summary>
        /// این متد تاریخ میلادی معادل شمسی را برمی پرداند
        /// </summary>
        /// <returns></returns>
        public DateTime? MiladyDate
        {
            get
            {
                if (IsNull)
                    return null;
                var a = new PersianCalendar();
                return a.ToDateTime(Year.Value, (int)Month.Value, Day.Value, 0, 0, 0, 0);
            }
        }

        public DayOfPersianWeek1? DayOfWeek1
        {
            get
            {
                if (IsNull)
                    return null;
                var i = this.DayOfWeek.Value.ConvertToInt().Value - 1;
                return (DayOfPersianWeek1)Math.Pow(2, i);
            }
        }

        public DayOfPersianWeek? DayOfWeek
        {
            get
            {
                if (IsNull)
                    return null;
                var i = (int)MiladyDate.Value.DayOfWeek;
                i += 2;
                if (i == 8)
                    i = 1;
                return (DayOfPersianWeek)i;
            }
        }



        public PersianDate FirstDayOfWeek()
        {
            var value = DayOfWeek.Value.ConvertToInt().Value - 1;
            return this.AddDays(-value);
        }

        public PersianDate FirstDayOfMonth()
        {
            return new PersianDate(this.Year.Value, this.Month.Value, 1);
        }

        public PersianDate AddMonth(int month)
        {
            if (IsNull)
                return null;
            month = month + Month.ConvertToInt().Value;
            var year = Year.Value + month / 12;
            month = Month.ConvertToInt().Value + month % 12;
            return new PersianDate(year, (PersianMonth)month, Day.Value);
        }

        public PersianDate AddDays(int day)
        {
            if (IsNull)
                return null;
            int year = day / 365;
            int remine = day % 365;
            int month = remine / 30;
            int day1 = remine % 30;
            day1 += Day.Value;
            month += (int)Month;
            year += Year.Value;
            if (month > 12)
            {
                year++;
                month -= 12;
            }
            if (day1 > 30)
            {
                month++;
                day1 -= 30;
                if (month == 12)
                {
                    month = 0;
                    year++;
                }
            }
            return new PersianDate(year, (PersianMonth)month, day);
        }

        public override string ToString()
        {
            return Date;
        }
        public string ToShortDateString()
        {
            return $"{Year}/{(int)Month}/{Day}";
        }

        public int? Year
        {
            get
            {
                if (Date.HasValue())
                {
                    var str = Date.Split(new char[] { '/' });
                    return Convert.ToInt32(str[0]);
                }
                return null;
            }
        }

        public PersianMonth? Month
        {
            get
            {
                if (Date.HasValue())
                {
                    var str = Date.Split(new char[] { '/' });
                    return (PersianMonth)Convert.ToInt32(str[1]);
                }
                return null;
            }
        }

        public int? Day
        {
            get
            {
                if (Date.HasValue())
                {
                    var date = Date.Split(' ')[0];
                    var str = date.Split(new char[] { '/' });
                    return Convert.ToInt32(str[2]);
                }
                return null;
            }
        }

        //public int? Houre
        //{
        //    get
        //    {
        //        if (Date.HasValue())
        //        {
        //            var array = Date.Split(' ');
        //            if (array.Length == )
        //            return Convert.ToInt32(str[2]);
        //        }
        //        return null;
        //    }
        //}

        ///// <summary>
        ///// 58/12/14
        ///// </summary>
        //[ReportField("فرمت:58/12/14", Where = false)]
        //public string ShortFormat
        //{
        //    get
        //    {
        //        if (Year.HasValue && Month.HasValue && Day.HasValue)
        //        {
        //            var year = Year;
        //            if (year > 100)
        //                year -= 1300;
        //            var str = year.ToString() + '/';
        //            if ((int)Month < 10)
        //                str += '0';
        //            str += ((int)Month).ToString() + '/';
        //            if (Day < 10)
        //                str += '0';
        //            str += Day.ToString();
        //            return str;
        //        }
        //        return null;
        //    }
        //}

        ///// <summary>
        ///// 14 اسفند 1358
        ///// </summary>
        //[ReportField("فرمت:14 اسفند 1358", Where = false)]
        //public string MiddFormat
        //{
        //    get
        //    {
        //        if (Year.HasValue && Month.HasValue && Day.HasValue)
        //        {
        //            var str = "";
        //            if (Day < 10)
        //                str += '0';
        //            str += Day.ToString() + ' ';
        //            str += Month.GetName() + ' ';
        //            var year = Year;
        //            if (year < 100)
        //                year += 1300;
        //            str += year.ToString();
        //            return str;
        //        }
        //        return null;
        //    }
        //}

        ///// <summary>
        ///// چهاردهم اسفند 1358
        ///// </summary>
        //[ReportField("فرمت:چهاردهم اسفند 1358", Where = false)]
        //public string Format
        //{
        //    get
        //    {
        //        if (IsNull)
        //            return null;
        //        var year = Year.Value;
        //        if (year < 100)
        //            year += 1300;
        //        return _DayOfMonth[Day.Value - 1] + ' ' + Month.Value.GetName() + ' ' + year.ToString();
        //    }
        //}

        ///// <summary>
        ///// یکشنبه چهاردهم اسفند 1358
        ///// </summary>
        //[ReportField("فرمت:یکشنبه چهاردهم اسفند 1358", Where = false)]
        //public string LargFormat
        //{
        //    get
        //    {
        //        if (IsNull)
        //            return null;
        //        var year = Year.Value;
        //        if (year < 100)
        //            year += 1300;
        //        return DayOfWeek.Value.GetName() + ' ' + _DayOfMonth[Day.Value - 1] + ' ' + Month.Value.GetName() + ' ' + year.ToString();
        //    }
        //}

        public int CompareTo(PersianDate date)
        {
            if (Date == null || date == null || date.Date == null)
                return -5;
            return Date.CompareTo(date.Date);
        }

        public override bool Equals(object obj)
        {
            var temp = obj as PersianDate;
            if (obj == null)
                return false;
            if (obj.GetType() == typeof(string) && !Convert.ToString(obj).HasValue())
                return false;
            return this.Date == (obj as PersianDate).Date;
        }

        public override int GetHashCode()
        {
            if (Date == null)
                return "".GetHashCode();
            return Date.GetHashCode();
        }
    }

    /// <summary>
    /// روزهای هفته در تقویم شمسی
    /// </summary>
    public enum DayOfPersianWeek: byte
    { 
        /// <summary>
        /// شنبه
        /// </summary>
        [EnumField("شنبه")]
        Sat = 1,
        
        /// <summary>
        /// یکشنبه
        /// </summary>
        [EnumField("یکشنبه")]
        Sun,
        
        /// <summary>
        /// دوشنبه
        /// </summary>
        [EnumField("دوشنبه")]
        Mon,
        
        /// <summary>
        /// سه شنبه
        /// </summary>
        [EnumField("سه شنبه")]
        Tus,

        /// <summary>
        /// چهارشنبه
        /// </summary>
        [EnumField("چهارشنبه")]
        Wed,

        /// <summary>
        /// پنجشنبه
        /// </summary>
        [EnumField("پنجشنبه")]
        Teh,

        /// <summary>
        /// جمعه
        /// </summary>
        [EnumField("جمعه")]
        Fri
    }

    /// <summary>
    /// ماهها سال در تقویم شمسی
    /// </summary>
    public enum PersianMonth
    {
        /// <summary>
        /// فروردین
        /// </summary>
        [EnumField("فروردین")]
        Farvardin = 1,

        /// <summary>
        /// اردیبهشت
        /// </summary>
        [EnumField("اردیبهشت")]
        Ordibehesht,

        /// <summary>
        /// خرداد
        /// </summary>
        [EnumField("خرداد")]
        Khordad,

        /// <summary>
        /// تیر
        /// </summary>
        [EnumField("تیر")]
        Tear,

        /// <summary>
        /// مرداد
        /// </summary>
        [EnumField("مرداد")]
        Mordad,

        /// <summary>
        /// شهریور
        /// </summary>
        [EnumField("شهریور")]
        Shahrivar,

        /// <summary>
        /// مهر
        /// </summary>
        [EnumField("مهر")]
        Mehr,

        /// <summary>
        /// آبان
        /// </summary>
        [EnumField("آبان")]
        Aban,

        /// <summary>
        /// آذر
        /// </summary>
        [EnumField("آذر")]
        Azar,

        /// <summary>
        /// دی
        /// </summary>
        [EnumField("دی")]
        Day,

        /// <summary>
        /// بهمن
        /// </summary>
        [EnumField("بهمن")]
        Bahman,

        /// <summary>
        /// اسفند
        /// </summary>
        [EnumField("اسفند")]
        Esfand
    }

    /// <summary>
    /// روزهای سال در تقویم شمسی بصورت توانی از دو
    /// </summary>
    public enum DayOfPersianWeek1: byte
    {
        /// <summary>
        /// شنبه
        /// </summary>
        [EnumField("شنبه")]
        Sat = 1,

        /// <summary>
        /// یکشنبه
        /// </summary>
        [EnumField("یکشنبه")]
        Sun = 2,

        /// <summary>
        /// دوشنبه
        /// </summary>
        [EnumField("دوشنبه")]
        Mon = 4,

        /// <summary>
        /// سه شنبه
        /// </summary>
        [EnumField("سه شنبه")]
        Tus = 8,

        /// <summary>
        /// چهارشنبه
        /// </summary>
        [EnumField("چهارشنبه")]
        Wed = 16,

        /// <summary>
        /// پنجشنبه
        /// </summary>
        [EnumField("پنجشنبه")]
        Teh = 32,

        /// <summary>
        /// جمعه
        /// </summary>
        [EnumField("جمعه")]
        Fri = 64
    }
}
