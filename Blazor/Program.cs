using System;
using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace BlazorApp1
{
    public class Program
    {
        public static void Main(string[] args)
        {
            
            AppDomain currentDomain = AppDomain.CurrentDomain;
            currentDomain.FirstChanceException += CurrentDomain_FirstChanceException;
            currentDomain.UnhandledException += CurrentDomain_UnhandledException;
            CreateHostBuilder(args).UseEnvironment(Microsoft.AspNetCore.Hosting.EnvironmentName.Development).Build().Run();
        }

        private static void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            
        }

        private static void CurrentDomain_FirstChanceException(object sender, System.Runtime.ExceptionServices.FirstChanceExceptionEventArgs e)
        {
            


        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
