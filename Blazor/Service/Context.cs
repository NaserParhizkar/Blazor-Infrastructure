using Common;
using Common.Extension;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlazorApp1.Service
{
    public class Context : MyContext
    {
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("server=.;database=test;integrated security=true");

            base.OnConfiguring(optionsBuilder);
        }

        public DbSet<Province> Provinces { get; set; }

        public DbSet<Customer> Customers { get; set; }
    }


    [Table("Customers")]
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        public string FName { get; set; }

        public string LName { get; set; }

        public string ParentName { get; set; }

        public int AreaId { get; set; }

        [ForeignKey(nameof(AreaId))]
        public virtual Area Area { get; set; }

        public Gender Gender { get; set; }
    }

    public enum Gender
    {
        [EnumField("مرد")]
        Male = 1,

        [EnumField("زن")]
        Female
    }

    [Table("Areas")]
    public class Area
    {
        [Key]
        public int Id { get; set; }

        public string Title { get; set; }

        public int CityId { get; set; }

        [ForeignKey(nameof(CityId))]
        public virtual City City { get; set; }
    }

    [Table("Cities")]
    public class City
    {
        [Key]
        public int Id { get; set; }

        public int ProvinceId { get; set; }

        [ForeignKey(nameof(ProvinceId))]
        public virtual Province Province { get; set; }

        public string Title { get; set; }
    }

    [Table("Provinces")]
    public class Province
    {
        [Key]
        public int Id { get; set; }

        public string Title { get; set; }
    }
}
