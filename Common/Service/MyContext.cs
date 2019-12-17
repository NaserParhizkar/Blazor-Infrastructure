using System;
using Microsoft.EntityFrameworkCore;

namespace Common
{
    public class MyContext : DbContext
    {
        public MyContext(DbContextOptions<MyContext> options = null)
            : base(options)
        {

        }

        public MyContext()
        {
            
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(CS.Con);
            //optionsBuilder.UseLazyLoadingProxies(true);
            base.OnConfiguring(optionsBuilder);
        }

        [DbFunction("ConvertToInteger", Schema = "dbo")]
        public static int? ConvertToInteger(string value)
        {
            throw new NotImplementedException("خطا:this method mapped to sql and no need to called");
        }

        [DbFunction("ConvertToDecimal", Schema = "dbo")]
        public static decimal? ConvertToDecimal(string value)
        {
            throw new NotImplementedException("خطا:this method mapped to sql and no need to called");
        }

        [DbFunction("ConvertToString", Schema = "dbo")]
        public static string ConvertToString(int value)
        {
            throw new NotImplementedException("خطا:this method mapped to sql and no need to called");
        }

        [DbFunction("EnumFaName", Schema = "dbo")]
        public string EnumFaName(string value)
        {
            throw new NotImplementedException("خطا:this method mapped to sql and no need to called");
        }

        public bool IsDisposed { get; private set; }

        public override void Dispose()
        {
            IsDisposed = true;
            base.Dispose();
        }
    }
}