namespace MyComponent.UI
{
    public enum SelectType
    {
        None,
        Single,
        Multi
    }

    public enum RowSelectType
    {
        /// <summary>
        /// در هنگام ویرایش و یا حذف رکورد
        /// در صورتی که امکان انتخاب یک رکورد وجود داشته باشد
        /// رکورد انتخاب می شود و در غیراینصورت انتخاب نمی شود
        /// </summary>
        Default,

        /// <summary>
        /// در هنگام ویرایش و یا حذف رکورد
        /// همواره رکورد انتخاب می شود
        /// </summary>
        Always,

        /// <summary>
        /// در هنگام ویرایش و یا حذف رکورد
        /// در هیچ حالت رکورد انتخاب نمی شود
        /// </summary>
        Never
    }

}
