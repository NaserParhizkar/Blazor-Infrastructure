using System;

namespace Common
{
    public class CS
    {
        public static string Con
        {
            get
            {
                return "Server=.;database=Test;integrated security=true";
                //return ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
            }
        }
    }
}
