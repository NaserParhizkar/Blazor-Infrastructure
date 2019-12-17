using System;

namespace BlazorApp1.Data
{
    public class WeatherForecast
    {
        public DateTime Date { get; set; }

        public int TemperatureC { get; set; }

        public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

        public string Summary { get; set; }
    }

    public class BirthCity
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public Province Province { get; set; }
    }

    public class Province
    {
        public int Id { get; set; }

        public string Title { get; set; }
    }
}
