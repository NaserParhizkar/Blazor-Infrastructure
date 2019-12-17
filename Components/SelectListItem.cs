using Newtonsoft.Json;
namespace MyComponent
{
    public class SelectListItem
    {
        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("value")]
        public string Value { get; set; }
    }
}
